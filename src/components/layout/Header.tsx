import { useAuth } from '@/context/AuthContext';
import { BellRing, Search, Menu, Shield, ChevronDown } from 'lucide-react';
import { AnimateIcon } from '@/components/ui/AnimateIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/recruitment';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export const Header = ({ title, onMenuClick }: HeaderProps) => {
  const { user, switchRole } = useAuth();

  const roles: { value: UserRole; label: string; description?: string }[] = [
    { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
    { value: 'admin', label: 'Admin (HR)', description: 'Recruitment & Offers' },
    { value: 'hiring_manager', label: 'Hiring Manager', description: 'Demands & Candidates' },
    { value: 'interviewer', label: 'Interviewer', description: 'Conduct Interviews' },
  ];

  const roleRanks: Record<UserRole, number> = {
    super_admin: 4,
    admin: 3,
    hiring_manager: 2,
    interviewer: 1,
  };

  const originalRole = user?.originalRole || user?.role || 'interviewer';
  const userRank = roleRanks[originalRole];

  const availableRoles = roles.filter(role => roleRanks[role.value] <= userRank);

  return (
    <header className="h-16 bg-card border-b border-border px-4 lg:px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates, demands..."
            className="pl-10 w-64 bg-background"
          />
        </div>

        {/* Role Switcher - Visible for roles with switching permissions (super_admin, admin, hiring_manager) */}
        {availableRoles.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">{roles.find(r => r.value === user?.role)?.label}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {availableRoles.map(role => (
                <DropdownMenuItem
                  key={role.value}
                  onClick={() => switchRole(role.value)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative group">
              <AnimateIcon animateOnHover>
                <BellRing className="h-5 w-5" />
              </AnimateIcon>
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-popover">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p>New interview scheduled for tomorrow</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
