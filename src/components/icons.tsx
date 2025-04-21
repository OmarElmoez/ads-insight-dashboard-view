import {
  BarChart3,
  Settings,
  Menu,
  Home,
  LayoutDashboard,
  BellRing, 
  Search,
  X,
  User,
  LogOut,
  FolderOpen,
  MessageSquare,
  PieChart,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
  dashboard: LayoutDashboard,
  campaign: FolderOpen,
  analytics: BarChart3,
  settings: Settings,
  home: Home,
  menu: Menu,
  notification: BellRing,
  search: Search,
  close: X,
  user: User,
  logout: LogOut,
  message: MessageSquare,
  chart: PieChart,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
} 