'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
    mockProjects,
    mockAllocations,
    mockAllocationHistory,
    mockClients
} from '@/data/mockData';
import { Project, ResourceAllocation, Client, ProjectStatus } from '@/types/recruitment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Plus,
    FolderKanban,
    Users,
    History,
    Building2,
    Calendar,
    Code2,
    MoreHorizontal,
    UserPlus,
    Clock,
    ArrowRightLeft,
    Mail,
    Phone,
    User,
    Pencil,
    X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const projectStatusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
    on_hold: { label: 'On Hold', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
    completed: { label: 'Completed', className: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
    cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

const allocationStatusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-green-500/10 text-green-600' },
    ended: { label: 'Ended', className: 'bg-gray-500/10 text-gray-600' },
    upcoming: { label: 'Upcoming', className: 'bg-blue-500/10 text-blue-600' },
};

const Projects = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [projects, setProjects] = useState<Project[]>(mockProjects);
    const [allocations, setAllocations] = useState<ResourceAllocation[]>(mockAllocations);
    const [clients, setClients] = useState<Client[]>(mockClients);

    // Dialog states
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const [isEditClientOpen, setIsEditClientOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isEditAllocationOpen, setIsEditAllocationOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isEndAllocationOpen, setIsEndAllocationOpen] = useState(false);
    const [selectedAllocation, setSelectedAllocation] = useState<ResourceAllocation | null>(null);
    const [isAllocateResourceOpen, setIsAllocateResourceOpen] = useState(false);
    const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);

    // New Project form state
    const [newProject, setNewProject] = useState({
        name: '',
        clientId: '',
        description: '',
        status: 'active' as ProjectStatus,
        startDate: '',
        endDate: '',
        teamSize: '',
        techStack: '',
        projectManager: '',
    });

    // Edit Allocation form state
    const [editAllocationData, setEditAllocationData] = useState({
        role: '',
        allocationPercentage: '',
        endDate: '',
    });

    // Transfer form state
    const [transferProjectId, setTransferProjectId] = useState('');

    // Edit Client form state
    const [editClientData, setEditClientData] = useState({
        name: '',
        industry: '',
        contactPerson: '',
        email: '',
        phone: '',
        projectCount: '',
        activeProjects: '',
    });

    // New Client form state
    const [newClientData, setNewClientData] = useState({
        name: '',
        industry: '',
        contactPerson: '',
        email: '',
        phone: '',
        projectCount: '',
        activeProjects: '',
    });

    // Filter projects
    const filteredProjects = projects.filter(project => {
        const matchesSearch = !search ||
            project.name.toLowerCase().includes(search.toLowerCase()) ||
            project.clientName.toLowerCase().includes(search.toLowerCase()) ||
            project.techStack.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const activeCount = projects.filter(p => p.status === 'active').length;
    const onHoldCount = projects.filter(p => p.status === 'on_hold').length;
    const completedCount = projects.filter(p => p.status === 'completed').length;

    const projectAllocations = selectedProject
        ? allocations.filter(a => a.projectId === selectedProject.id)
        : [];

    // Handlers
    const handleProjectClick = (project: Project) => {
        setSelectedProject(project);
        setIsDetailOpen(true);
    };

    const handleCreateProject = () => {
        if (!newProject.name || !newProject.clientId || !newProject.projectManager) {
            toast.error('Please fill in all required fields');
            return;
        }

        const client = clients.find(c => c.id === newProject.clientId);
        const project: Project = {
            id: String(projects.length + 1),
            name: newProject.name,
            clientId: newProject.clientId,
            clientName: client?.name || '',
            description: newProject.description,
            status: newProject.status,
            startDate: newProject.startDate ? new Date(newProject.startDate) : new Date(),
            endDate: newProject.endDate ? new Date(newProject.endDate) : undefined,
            teamSize: parseInt(newProject.teamSize) || 5,
            allocatedResources: 0,
            techStack: newProject.techStack.split(',').map(s => s.trim()).filter(Boolean),
            projectManager: newProject.projectManager,
        };

        setProjects([project, ...projects]);
        setIsNewProjectOpen(false);
        setNewProject({
            name: '', clientId: '', description: '', status: 'active',
            startDate: '', endDate: '', teamSize: '', techStack: '', projectManager: '',
        });
        toast.success(`Project "${project.name}" created successfully`);
    };

    // Edit Client
    const handleEditClient = (client: Client) => {
        setSelectedClient(client);
        setEditClientData({
            name: client.name,
            industry: client.industry,
            contactPerson: client.contactPerson,
            email: client.email,
            phone: client.phone,
            projectCount: String(client.projectCount),
            activeProjects: String(client.activeProjects),
        });
        setIsEditClientOpen(true);
    };

    const handleSaveClient = () => {
        if (!selectedClient) return;
        setClients(clients.map(c =>
            c.id === selectedClient.id ? {
                ...c,
                ...editClientData,
                projectCount: parseInt(editClientData.projectCount) || 0,
                activeProjects: parseInt(editClientData.activeProjects) || 0,
            } : c
        ));
        setIsEditClientOpen(false);
        toast.success(`Client "${editClientData.name}" updated successfully`);
    };

    // Add Client
    const handleAddClient = () => {
        if (!newClientData.name || !newClientData.contactPerson) {
            toast.error('Please fill in client name and contact person');
            return;
        }

        const client: Client = {
            id: String(clients.length + 1),
            name: newClientData.name,
            industry: newClientData.industry,
            contactPerson: newClientData.contactPerson,
            email: newClientData.email,
            phone: newClientData.phone,
            projectCount: parseInt(newClientData.projectCount) || 0,
            activeProjects: parseInt(newClientData.activeProjects) || 0,
        };

        setClients([client, ...clients]);
        setIsAddClientOpen(false);
        setNewClientData({
            name: '', industry: '', contactPerson: '', email: '', phone: '',
            projectCount: '', activeProjects: ''
        });
        toast.success(`Client "${client.name}" added successfully`);
    };

    // Edit Allocation
    const handleEditAllocation = (allocation: ResourceAllocation) => {
        setSelectedAllocation(allocation);
        setEditAllocationData({
            role: allocation.role,
            allocationPercentage: String(allocation.allocationPercentage),
            endDate: allocation.endDate ? format(allocation.endDate, 'yyyy-MM-dd') : '',
        });
        setIsEditAllocationOpen(true);
    };

    const handleSaveAllocation = () => {
        if (!selectedAllocation) return;
        setAllocations(allocations.map(a =>
            a.id === selectedAllocation.id ? {
                ...a,
                role: editAllocationData.role,
                allocationPercentage: parseInt(editAllocationData.allocationPercentage) || a.allocationPercentage,
                endDate: editAllocationData.endDate ? new Date(editAllocationData.endDate) : a.endDate,
            } : a
        ));
        setIsEditAllocationOpen(false);
        toast.success(`Allocation updated for ${selectedAllocation.resourceName}`);
    };

    // Transfer Resource
    const handleTransfer = (allocation: ResourceAllocation) => {
        setSelectedAllocation(allocation);
        setTransferProjectId('');
        setIsTransferOpen(true);
    };

    const handleConfirmTransfer = () => {
        if (!selectedAllocation || !transferProjectId) {
            toast.error('Please select a project to transfer to');
            return;
        }
        const newProject = projects.find(p => p.id === transferProjectId);
        setAllocations(allocations.map(a =>
            a.id === selectedAllocation.id ? {
                ...a,
                projectId: transferProjectId,
                projectName: newProject?.name || a.projectName,
                clientName: newProject?.clientName || a.clientName,
            } : a
        ));
        setIsTransferOpen(false);
        toast.success(`${selectedAllocation.resourceName} transferred to ${newProject?.name}`);
    };

    // End Allocation
    const handleEndAllocation = (allocation: ResourceAllocation) => {
        setSelectedAllocation(allocation);
        setIsEndAllocationOpen(true);
    };

    const handleConfirmEndAllocation = () => {
        if (!selectedAllocation) return;
        setAllocations(allocations.map(a =>
            a.id === selectedAllocation.id ? { ...a, status: 'ended' as const, endDate: new Date() } : a
        ));
        setIsEndAllocationOpen(false);
        toast.success(`Allocation ended for ${selectedAllocation.resourceName}`);
    };

    // Allocate Resource state
    const [newAllocation, setNewAllocation] = useState({
        resourceName: '',
        resourceEmail: '',
        role: '',
        skills: '',
        allocationPercentage: '100',
        startDate: '',
        endDate: '',
    });

    // Edit Project state
    const [editProjectData, setEditProjectData] = useState({
        name: '',
        description: '',
        status: 'active' as ProjectStatus,
        endDate: '',
        teamSize: '',
        techStack: '',
        projectManager: '',
    });

    // Allocate Resource handler
    const handleAllocateResource = (project: Project) => {
        setSelectedProject(project);
        setNewAllocation({
            resourceName: '',
            resourceEmail: '',
            role: '',
            skills: '',
            allocationPercentage: '100',
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: '',
        });
        setIsAllocateResourceOpen(true);
    };

    const handleConfirmAllocateResource = () => {
        if (!selectedProject || !newAllocation.resourceName || !newAllocation.role) {
            toast.error('Please fill in resource name and role');
            return;
        }

        const allocation: ResourceAllocation = {
            id: String(allocations.length + 1),
            resourceId: String(allocations.length + 1),
            resourceName: newAllocation.resourceName,
            resourceEmail: newAllocation.resourceEmail || `${newAllocation.resourceName.toLowerCase().replace(' ', '.')}@company.com`,
            projectId: selectedProject.id,
            projectName: selectedProject.name,
            clientName: selectedProject.clientName,
            role: newAllocation.role,
            skills: newAllocation.skills.split(',').map(s => s.trim()).filter(Boolean),
            allocationPercentage: parseInt(newAllocation.allocationPercentage) || 100,
            startDate: newAllocation.startDate ? new Date(newAllocation.startDate) : new Date(),
            endDate: newAllocation.endDate ? new Date(newAllocation.endDate) : undefined,
            status: 'active',
        };

        setAllocations([...allocations, allocation]);
        setProjects(projects.map(p =>
            p.id === selectedProject.id ? { ...p, allocatedResources: p.allocatedResources + 1 } : p
        ));
        setIsAllocateResourceOpen(false);
        toast.success(`${newAllocation.resourceName} allocated to ${selectedProject.name}`);
    };

    // Edit Project handler
    const handleEditProject = (project: Project) => {
        setProjectToEdit(project);
        setEditProjectData({
            name: project.name,
            description: project.description || '',
            status: project.status,
            endDate: project.endDate ? format(project.endDate, 'yyyy-MM-dd') : '',
            teamSize: String(project.teamSize),
            techStack: project.techStack.join(', '),
            projectManager: project.projectManager,
        });
        setIsEditProjectOpen(true);
    };

    const handleSaveProject = () => {
        if (!projectToEdit) return;
        setProjects(projects.map(p =>
            p.id === projectToEdit.id ? {
                ...p,
                name: editProjectData.name,
                description: editProjectData.description,
                status: editProjectData.status,
                endDate: editProjectData.endDate ? new Date(editProjectData.endDate) : p.endDate,
                teamSize: parseInt(editProjectData.teamSize) || p.teamSize,
                techStack: editProjectData.techStack.split(',').map(s => s.trim()).filter(Boolean),
                projectManager: editProjectData.projectManager,
            } : p
        ));
        setIsEditProjectOpen(false);
        toast.success(`Project "${editProjectData.name}" updated successfully`);
    };


    return (
        <DashboardLayout title="Projects & Allocations">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Projects & Allocations</h2>
                        <p className="text-muted-foreground mt-1">
                            Manage projects, track resource allocations and assignment history
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="projects" className="w-full">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="projects" className="gap-2">
                            <FolderKanban className="w-4 h-4" />
                            Projects
                            <Badge variant="secondary" className="ml-1">{projects.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="allocations" className="gap-2">
                            <Users className="w-4 h-4" />
                            Current Allocations
                            <Badge variant="secondary" className="ml-1">{allocations.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2">
                            <History className="w-4 h-4" />
                            Allocation History
                        </TabsTrigger>
                        <TabsTrigger value="clients" className="gap-2">
                            <Building2 className="w-4 h-4" />
                            Clients
                            <Badge variant="secondary" className="ml-1">{clients.length}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    {/* Projects Tab */}
                    <TabsContent value="projects" className="mt-6 space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                                onClick={() => setIsNewProjectOpen(true)}
                            >
                                <Plus className="w-4 h-4" />
                                New Project
                            </Button>

                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search projects, clients, tech..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="flex gap-2">
                                {['all', 'active', 'on_hold', 'completed'].map(status => (
                                    <Button
                                        key={status}
                                        variant={statusFilter === status ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setStatusFilter(status)}
                                    >
                                        {status === 'all' ? 'All' : status === 'on_hold' ? 'On Hold' : status.charAt(0).toUpperCase() + status.slice(1)}
                                        {' '}({status === 'all' ? projects.length : status === 'active' ? activeCount : status === 'on_hold' ? onHoldCount : completedCount})
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Projects Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredProjects.map(project => {
                                const status = projectStatusConfig[project.status];
                                const allocationPercentage = (project.allocatedResources / project.teamSize) * 100;

                                return (
                                    <div
                                        key={project.id}
                                        className="bg-card border border-border rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer"
                                        onClick={() => handleProjectClick(project)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
                                                    <Badge className={cn('text-xs shrink-0', status.className)}>
                                                        {status.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    {project.clientName}
                                                </p>
                                            </div>
                                            <div onClick={e => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleProjectClick(project)}>
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAllocateResource(project)}>
                                                            <UserPlus className="mr-2 h-4 w-4" />
                                                            Allocate Resource
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditProject(project)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit Project
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {project.description && (
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-1.5 mt-4">
                                            {project.techStack.slice(0, 4).map(tech => (
                                                <span
                                                    key={tech}
                                                    className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded flex items-center gap-1"
                                                >
                                                    <Code2 className="w-3 h-3" />
                                                    {tech}
                                                </span>
                                            ))}
                                            {project.techStack.length > 4 && (
                                                <span className="text-xs text-muted-foreground">
                                                    +{project.techStack.length - 4} more
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-border">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-muted-foreground flex items-center gap-1.5">
                                                    <Users className="w-3.5 h-3.5" />
                                                    Team Allocation
                                                </span>
                                                <span className="font-medium text-foreground">
                                                    {project.allocatedResources}/{project.teamSize}
                                                </span>
                                            </div>
                                            <Progress value={allocationPercentage} className="h-2" />
                                        </div>

                                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(project.startDate, 'MMM yyyy')}
                                                {project.endDate && ` - ${format(project.endDate, 'MMM yyyy')}`}
                                            </span>
                                            <span>PM: {project.projectManager}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredProjects.length === 0 && (
                            <div className="text-center py-12">
                                <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground/50" />
                                <p className="mt-4 text-muted-foreground">No projects found</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Current Allocations Tab */}
                    <TabsContent value="allocations" className="mt-6">
                        <div className="bg-card border border-border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Resource</th>
                                            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Project / Client</th>
                                            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                                            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Allocation</th>
                                            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Duration</th>
                                            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                                            <th className="p-4 text-left w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allocations.map(allocation => {
                                            const status = allocationStatusConfig[allocation.status];
                                            return (
                                                <tr
                                                    key={allocation.id}
                                                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                                >
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="w-9 h-9">
                                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                                    {allocation.resourceName.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium text-foreground">{allocation.resourceName}</p>
                                                                <p className="text-xs text-muted-foreground">{allocation.resourceEmail}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div>
                                                            <p className="font-medium text-foreground">{allocation.projectName}</p>
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Building2 className="w-3 h-3" />
                                                                {allocation.clientName}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div>
                                                            <p className="text-sm text-foreground">{allocation.role}</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {allocation.skills.slice(0, 2).map(skill => (
                                                                    <span
                                                                        key={skill}
                                                                        className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded"
                                                                    >
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="w-24">
                                                            <div className="flex items-center justify-between text-xs mb-1">
                                                                <span className="text-muted-foreground">Allocation</span>
                                                                <span className="font-medium text-foreground">{allocation.allocationPercentage}%</span>
                                                            </div>
                                                            <Progress value={allocation.allocationPercentage} className="h-1.5" />
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            <span>{format(allocation.startDate, 'MMM d, yyyy')}</span>
                                                            {allocation.endDate && (
                                                                <>
                                                                    <span>-</span>
                                                                    <span>{format(allocation.endDate, 'MMM d, yyyy')}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge className={cn('text-xs', status.className)}>
                                                            {status.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleEditAllocation(allocation)}>
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit Allocation
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleTransfer(allocation)}>
                                                                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                                    Transfer Resource
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleEndAllocation(allocation)}
                                                                >
                                                                    <X className="mr-2 h-4 w-4" />
                                                                    End Allocation
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {allocations.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    No allocations found
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Allocation History Tab */}
                    <TabsContent value="history" className="mt-6">
                        <div className="bg-card border border-border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Resource</th>
                                            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Project / Client</th>
                                            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                                            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Period</th>
                                            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockAllocationHistory.map(item => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-9 h-9">
                                                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                                                {item.resourceName.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <p className="font-medium text-foreground">{item.resourceName}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium text-foreground">{item.projectName}</p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Building2 className="w-3 h-3" />
                                                            {item.clientName}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm text-foreground">{item.role}</p>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>
                                                            {format(item.startDate, 'MMM yyyy')} - {format(item.endDate, 'MMM yyyy')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{item.duration}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Clients Tab */}
                    <TabsContent value="clients" className="mt-6 space-y-4">
                        <div>
                            <Button
                                className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                                onClick={() => setIsAddClientOpen(true)}
                            >
                                <Plus className="w-4 h-4" />
                                Add Client
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {clients.map(client => (
                                <div
                                    key={client.id}
                                    className="bg-card border border-border rounded-lg p-5 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-foreground">{client.name}</h3>
                                                <p className="text-sm text-muted-foreground">{client.industry}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleEditClient(client)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <User className="w-4 h-4" />
                                            <span>{client.contactPerson}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{client.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="w-4 h-4" />
                                            <span>{client.phone}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Total Projects</p>
                                            <p className="font-semibold text-foreground">{client.projectCount}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-muted-foreground">Active</p>
                                            <p className="font-semibold text-green-600">{client.activeProjects}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Project Detail Drawer */}
                <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                        {selectedProject && (
                            <>
                                <SheetHeader className="pb-6 border-b border-border">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <SheetTitle className="text-xl">{selectedProject.name}</SheetTitle>
                                            <Badge className={cn('text-xs', projectStatusConfig[selectedProject.status].className)}>
                                                {projectStatusConfig[selectedProject.status].label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                            <Building2 className="w-4 h-4" />
                                            {selectedProject.clientName}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button size="sm" className="gap-2" onClick={() => handleAllocateResource(selectedProject)}>
                                            <UserPlus className="w-4 h-4" />
                                            Allocate Resource
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleEditProject(selectedProject)}>
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Edit Project
                                        </Button>
                                    </div>
                                </SheetHeader>

                                <Tabs defaultValue="overview" className="mt-6">
                                    <TabsList className="w-full">
                                        <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                                        <TabsTrigger value="team" className="flex-1">Team ({projectAllocations.length})</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview" className="mt-6 space-y-6">
                                        {selectedProject.description && (
                                            <div>
                                                <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
                                                <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-muted"><User className="w-4 h-4 text-muted-foreground" /></div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Project Manager</p>
                                                    <p className="text-sm font-medium text-foreground">{selectedProject.projectManager}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-muted"><Calendar className="w-4 h-4 text-muted-foreground" /></div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Start Date</p>
                                                    <p className="text-sm font-medium text-foreground">{format(selectedProject.startDate, 'MMM d, yyyy')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-muted"><Users className="w-4 h-4 text-muted-foreground" /></div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Team Size</p>
                                                    <p className="text-sm font-medium text-foreground">{selectedProject.teamSize} members</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="font-medium text-foreground">Team Allocation</span>
                                                <span className="text-muted-foreground">{selectedProject.allocatedResources}/{selectedProject.teamSize} allocated</span>
                                            </div>
                                            <Progress value={(selectedProject.allocatedResources / selectedProject.teamSize) * 100} className="h-3" />
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-foreground mb-3">Tech Stack</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProject.techStack.map(tech => (
                                                    <span key={tech} className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full flex items-center gap-1.5">
                                                        <Code2 className="w-3.5 h-3.5" />{tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="team" className="mt-6">
                                        {projectAllocations.length > 0 ? (
                                            <div className="space-y-3">
                                                {projectAllocations.map(allocation => (
                                                    <div key={allocation.id} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="w-10 h-10">
                                                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                                                        {allocation.resourceName.split(' ').map(n => n[0]).join('')}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium text-foreground">{allocation.resourceName}</p>
                                                                    <p className="text-sm text-muted-foreground">{allocation.role}</p>
                                                                </div>
                                                            </div>
                                                            <Badge className={cn('text-xs', allocation.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600')}>
                                                                {allocation.allocationPercentage}%
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                                            {allocation.skills.map(skill => (
                                                                <span key={skill} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">{skill}</span>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Since {format(allocation.startDate, 'MMM yyyy')}</span>
                                                            <a href={`mailto:${allocation.resourceEmail}`} className="flex items-center gap-1 hover:text-foreground">
                                                                <Mail className="w-3 h-3" />{allocation.resourceEmail}
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-muted-foreground py-8">No team members allocated yet</p>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </>
                        )}
                    </SheetContent>
                </Sheet>

                {/* New Project Dialog */}
                <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="projectName">Project Name *</Label>
                                    <Input id="projectName" placeholder="Project name" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="client">Client *</Label>
                                    <Select value={newProject.clientId} onValueChange={(v) => setNewProject({ ...newProject, clientId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" placeholder="Project description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pm">Project Manager *</Label>
                                    <Input id="pm" placeholder="PM name" value={newProject.projectManager} onChange={(e) => setNewProject({ ...newProject, projectManager: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={newProject.status} onValueChange={(v) => setNewProject({ ...newProject, status: v as ProjectStatus })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="on_hold">On Hold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input id="startDate" type="date" value={newProject.startDate} onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input id="endDate" type="date" value={newProject.endDate} onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="teamSize">Team Size</Label>
                                    <Input id="teamSize" type="number" placeholder="e.g., 8" value={newProject.teamSize} onChange={(e) => setNewProject({ ...newProject, teamSize: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="techStack">Tech Stack</Label>
                                    <Input id="techStack" placeholder="React, Node.js, etc." value={newProject.techStack} onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateProject}>Create Project</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Client Dialog */}
                <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Client</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Client Name</Label>
                                <Input value={editClientData.name} onChange={(e) => setEditClientData({ ...editClientData, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Industry</Label>
                                <Input value={editClientData.industry} onChange={(e) => setEditClientData({ ...editClientData, industry: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Person</Label>
                                <Input value={editClientData.contactPerson} onChange={(e) => setEditClientData({ ...editClientData, contactPerson: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={editClientData.email} onChange={(e) => setEditClientData({ ...editClientData, email: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={editClientData.phone} onChange={(e) => setEditClientData({ ...editClientData, phone: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Total Projects</Label>
                                    <Input
                                        type="number"
                                        value={editClientData.projectCount}
                                        onChange={(e) => setEditClientData({ ...editClientData, projectCount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Active Projects</Label>
                                    <Input
                                        type="number"
                                        value={editClientData.activeProjects}
                                        onChange={(e) => setEditClientData({ ...editClientData, activeProjects: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditClientOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveClient}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Add Client Dialog */}
                <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Client</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Client Name *</Label>
                                <Input
                                    placeholder="Company name"
                                    value={newClientData.name}
                                    onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Industry</Label>
                                <Input
                                    placeholder="e.g., Technology, Finance"
                                    value={newClientData.industry}
                                    onChange={(e) => setNewClientData({ ...newClientData, industry: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Person *</Label>
                                <Input
                                    placeholder="Full name"
                                    value={newClientData.contactPerson}
                                    onChange={(e) => setNewClientData({ ...newClientData, contactPerson: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder="email@company.com"
                                    value={newClientData.email}
                                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    placeholder="+91 98765 43210"
                                    value={newClientData.phone}
                                    onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Total Projects</Label>
                                    <Input
                                        type="number"
                                        value={newClientData.projectCount}
                                        onChange={(e) => setNewClientData({ ...newClientData, projectCount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Active Projects</Label>
                                    <Input
                                        type="number"
                                        value={newClientData.activeProjects}
                                        onChange={(e) => setNewClientData({ ...newClientData, activeProjects: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddClient}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Client
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* Edit Allocation Dialog */}
                <Dialog open={isEditAllocationOpen} onOpenChange={setIsEditAllocationOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Allocation</DialogTitle>
                        </DialogHeader>
                        {selectedAllocation && (
                            <div className="space-y-4 py-4">
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {selectedAllocation.resourceName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{selectedAllocation.resourceName}</p>
                                        <p className="text-sm text-muted-foreground">{selectedAllocation.projectName}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input value={editAllocationData.role} onChange={(e) => setEditAllocationData({ ...editAllocationData, role: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Allocation Percentage</Label>
                                    <Input type="number" min="0" max="100" value={editAllocationData.allocationPercentage} onChange={(e) => setEditAllocationData({ ...editAllocationData, allocationPercentage: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input type="date" value={editAllocationData.endDate} onChange={(e) => setEditAllocationData({ ...editAllocationData, endDate: e.target.value })} />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditAllocationOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveAllocation}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Transfer Resource Dialog */}
                <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Transfer Resource</DialogTitle>
                        </DialogHeader>
                        {selectedAllocation && (
                            <div className="space-y-4 py-4">
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {selectedAllocation.resourceName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{selectedAllocation.resourceName}</p>
                                        <p className="text-sm text-muted-foreground">Currently: {selectedAllocation.projectName}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Transfer to Project</Label>
                                    <Select value={transferProjectId} onValueChange={setTransferProjectId}>
                                        <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                                        <SelectContent>
                                            {projects.filter(p => p.id !== selectedAllocation.projectId && p.status === 'active').map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name} - {p.clientName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
                            <Button onClick={handleConfirmTransfer}><ArrowRightLeft className="w-4 h-4 mr-2" />Transfer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* End Allocation Confirmation Dialog */}
                <Dialog open={isEndAllocationOpen} onOpenChange={setIsEndAllocationOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>End Allocation</DialogTitle>
                        </DialogHeader>
                        {selectedAllocation && (
                            <div className="py-4">
                                <p className="text-muted-foreground">
                                    Are you sure you want to end the allocation for <span className="font-medium text-foreground">{selectedAllocation.resourceName}</span> from <span className="font-medium text-foreground">{selectedAllocation.projectName}</span>?
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">This action will mark the allocation as ended with today's date.</p>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEndAllocationOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleConfirmEndAllocation}>End Allocation</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Allocate Resource Dialog */}
                <Dialog open={isAllocateResourceOpen} onOpenChange={setIsAllocateResourceOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Allocate Resource to {selectedProject?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Resource Name *</Label>
                                    <Input
                                        placeholder="Full name"
                                        value={newAllocation.resourceName}
                                        onChange={(e) => setNewAllocation({ ...newAllocation, resourceName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="email@company.com"
                                        value={newAllocation.resourceEmail}
                                        onChange={(e) => setNewAllocation({ ...newAllocation, resourceEmail: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Role *</Label>
                                <Input
                                    placeholder="e.g., Senior Developer"
                                    value={newAllocation.role}
                                    onChange={(e) => setNewAllocation({ ...newAllocation, role: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Skills (comma separated)</Label>
                                <Input
                                    placeholder="React, Node.js, TypeScript"
                                    value={newAllocation.skills}
                                    onChange={(e) => setNewAllocation({ ...newAllocation, skills: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Allocation %</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={newAllocation.allocationPercentage}
                                        onChange={(e) => setNewAllocation({ ...newAllocation, allocationPercentage: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={newAllocation.startDate}
                                        onChange={(e) => setNewAllocation({ ...newAllocation, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={newAllocation.endDate}
                                        onChange={(e) => setNewAllocation({ ...newAllocation, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAllocateResourceOpen(false)}>Cancel</Button>
                            <Button onClick={handleConfirmAllocateResource}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Allocate
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Project Dialog */}
                <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Project Name</Label>
                                    <Input
                                        value={editProjectData.name}
                                        onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={editProjectData.status} onValueChange={(v) => setEditProjectData({ ...editProjectData, status: v as ProjectStatus })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="on_hold">On Hold</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editProjectData.description}
                                    onChange={(e) => setEditProjectData({ ...editProjectData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Project Manager</Label>
                                    <Input
                                        value={editProjectData.projectManager}
                                        onChange={(e) => setEditProjectData({ ...editProjectData, projectManager: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Team Size</Label>
                                    <Input
                                        type="number"
                                        value={editProjectData.teamSize}
                                        onChange={(e) => setEditProjectData({ ...editProjectData, teamSize: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={editProjectData.endDate}
                                        onChange={(e) => setEditProjectData({ ...editProjectData, endDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tech Stack</Label>
                                    <Input
                                        placeholder="React, Node.js"
                                        value={editProjectData.techStack}
                                        onChange={(e) => setEditProjectData({ ...editProjectData, techStack: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveProject}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}

export default Projects;
