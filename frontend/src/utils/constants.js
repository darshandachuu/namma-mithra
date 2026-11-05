export const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    variant: 'warning',
    bg: '#fef3c7',
    color: '#92400e',
    description: 'Submitted and awaiting administrative review.'
  },
  assigned: {
    label: 'Assigned',
    variant: 'info',
    bg: '#e0f2fe',
    color: '#0369a1',
    description: 'Assigned to a maintenance staff technician.'
  },
  in_progress: {
    label: 'In Progress',
    variant: 'primary',
    bg: '#dbeafe',
    color: '#1e40af',
    description: 'Maintenance work is currently underway.'
  },
  resolved: {
    label: 'Resolved',
    variant: 'success',
    bg: '#dcfce7',
    color: '#15803d',
    description: 'Work completed and issue has been fixed.'
  },
  closed: {
    label: 'Closed',
    variant: 'secondary',
    bg: '#f1f5f9',
    color: '#475569',
    description: 'Complaint verified and closed.'
  },
  rejected: {
    label: 'Rejected',
    variant: 'danger',
    bg: '#fee2e2',
    color: '#991b1b',
    description: 'Complaint declined by administration.'
  }
};

export const PRIORITY_CONFIG = {
  Critical: {
    label: 'Critical Priority (80-100)',
    variant: 'danger',
    bg: '#fee2e2',
    color: '#991b1b',
    badgeClass: 'badge-critical'
  },
  High: {
    label: 'High Priority (60-79)',
    variant: 'warning',
    bg: '#ffedd5',
    color: '#9a3412',
    badgeClass: 'badge-high'
  },
  Medium: {
    label: 'Medium Priority (35-59)',
    variant: 'info',
    bg: '#fef9c3',
    color: '#854d0e',
    badgeClass: 'badge-medium'
  },
  Low: {
    label: 'Low Priority (0-34)',
    variant: 'secondary',
    bg: '#f1f5f9',
    color: '#475569',
    badgeClass: 'badge-low'
  }
};

export const ROLE_LABELS = {
  student: 'Student',
  staff: 'Maintenance Staff',
  admin: 'Campus Administrator'
};
