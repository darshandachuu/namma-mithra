"""
Duplicate & Similar Complaint Detection Service
Rule-based matching on Category and Location
Allows students to view existing open issues and support them instead of creating duplicates.
CampusCare Platform
"""
from app.models.complaint import Complaint
from app.models.location import Location

def find_similar_complaints(category_id=None, location_id=None, exclude_complaint_id=None, current_user_id=None):
    """
    Finds active complaints that match the selected category and/or location.
    Only considers complaints that are not yet 'resolved' or 'closed'.
    """
    if not category_id and not location_id:
        return []

    # Active statuses
    active_statuses = ['pending', 'assigned', 'in_progress']

    query = Complaint.query.filter(Complaint.status.in_(active_statuses))
    if exclude_complaint_id:
        query = query.filter(Complaint.id != exclude_complaint_id)

    results = []

    # 1. Exact Match: Same category AND same location
    if category_id and location_id:
        exact_matches = query.filter_by(category_id=category_id, location_id=location_id).all()
        for c in exact_matches:
            item = c.to_dict(current_user_id=current_user_id)
            item['match_type'] = 'Exact Category & Location Match'
            item['match_confidence'] = 'High'
            item['match_reason'] = f"Another open complaint exists for {c.category.name} in {c.location.display_name}."
            results.append(item)

    # 2. Same Location Match (Different category, e.g. multiple issues in same room)
    if location_id:
        existing_ids = {r['id'] for r in results}
        location_matches = query.filter_by(location_id=location_id).all()
        for c in location_matches:
            if c.id not in existing_ids:
                item = c.to_dict(current_user_id=current_user_id)
                item['match_type'] = 'Same Location Match'
                item['match_confidence'] = 'Medium'
                item['match_reason'] = f"Another open complaint exists in the same room/area ({c.location.display_name})."
                results.append(item)

    # 3. Same Category in same building
    if category_id and location_id:
        target_loc = Location.query.get(location_id)
        if target_loc:
            existing_ids = {r['id'] for r in results}
            same_bldg_loc_ids = [l.id for l in Location.query.filter_by(building_name=target_loc.building_name).all()]
            bldg_matches = query.filter(
                Complaint.category_id == category_id,
                Complaint.location_id.in_(same_bldg_loc_ids)
            ).all()
            for c in bldg_matches:
                if c.id not in existing_ids:
                    item = c.to_dict(current_user_id=current_user_id)
                    item['match_type'] = 'Same Building & Category'
                    item['match_confidence'] = 'Low'
                    item['match_reason'] = f"Similar issue reported in {target_loc.building_name} ({c.location.display_name})."
                    results.append(item)

    return results
