import { useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import { useUserStore } from '../store/userStore'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { 
  CalendarIcon, 
  UserIcon, 
  TagIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

// ... existing code ... 