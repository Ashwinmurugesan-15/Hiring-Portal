'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { mockBenchResources } from '@/data/mockData';
import { BenchResource } from '@/types/recruitment';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    Search,
    UserPlus,
    Mail,
    MapPin,
    Briefcase,
    Clock,
    Phone,
    User,
    CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { mockDemands } from '@/data/mockData';

import { useRecruitment } from '@/context/RecruitmentContext';

export default function Bench() {
    const router = useRouter();
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const { benchResources: resources, addBenchResource, updateBenchResource } = useRecruitment();
    // const [resources, setResources] = useState<BenchResource[]>(mockBenchResources);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isAllocateOpen, setIsAllocateOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState<BenchResource | null>(null);
    const [selectedDemandId, setSelectedDemandId] = useState<string>('');

    // Form state for Add Resource
    const [newResource, setNewResource] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        skills: '',
        experience: '',
        location: '',
        expectedCTC: '',
        lastProject: '',
    });

    const filteredResources = resources.filter(resource => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            resource.name.toLowerCase().includes(searchLower) ||
            resource.skills.some(s => s.toLowerCase().includes(searchLower)) ||
            resource.location?.toLowerCase().includes(searchLower)
        );
    });

    const availableCount = resources.filter(r => r.status === 'available').length;

    // Handle Add Resource
    const handleAddResource = () => {
        if (!newResource.name || !newResource.email || !newResource.role) {
            toast.error('Please fill in all required fields');
            return;
        }

        const resource: BenchResource = {
            id: String(resources.length + 1),
            name: newResource.name,
            email: newResource.email,
            phone: newResource.phone,
            role: newResource.role,
            skills: newResource.skills.split(',').map(s => s.trim()).filter(Boolean),
            experience: newResource.experience,
            availableFrom: new Date(),
            status: 'available',
            location: newResource.location,
            expectedCTC: newResource.expectedCTC,
            lastProject: newResource.lastProject,
        };

        addBenchResource(resource);
        setIsAddOpen(false);
        setNewResource({
            name: '',
            email: '',
            phone: '',
            role: '',
            skills: '',
            experience: '',
            location: '',
            expectedCTC: '',
            lastProject: '',
        });
        toast.success(`${resource.name} has been added to bench resources`);
    };

    // Handle Contact
    const handleContact = (resource: BenchResource) => {
        setSelectedResource(resource);
        setIsContactOpen(true);
    };

    const sendEmail = () => {
        if (selectedResource) {
            window.open(`mailto:${selectedResource.email}?subject=Regarding Allocation Opportunity`);
            toast.success(`Opening email client for ${selectedResource.name}`);
            setIsContactOpen(false);
        }
    };

    const callPhone = () => {
        if (selectedResource) {
            window.open(`tel:${selectedResource.phone}`);
            toast.success(`Initiating call to ${selectedResource.name}`);
            setIsContactOpen(false);
        }
    };

    // Handle Allocate
    const handleAllocate = (resource: BenchResource) => {
        setSelectedResource(resource);
        setSelectedDemandId('');
        setIsAllocateOpen(true);
    };

    const confirmAllocate = () => {
        if (!selectedDemandId) {
            toast.error('Please select a demand to allocate');
            return;
        }

        if (selectedResource) {
            updateBenchResource({ ...selectedResource, status: 'allocated' });
            const demand = mockDemands.find(d => d.id === selectedDemandId);
            toast.success(`${selectedResource.name} has been allocated to "${demand?.title}"`);
            setIsAllocateOpen(false);
        }
    };

    const openDemands = mockDemands.filter(d => d.status === 'open');

    return (
        <DashboardLayout title="Bench Resources">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Bench Resources</h2>
                        <p className="text-muted-foreground mt-1">
                            {availableCount} resources currently available
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by name, skills..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button
                        className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => setIsAddOpen(true)}
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Resource
                    </Button>
                </div>

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResources.map(resource => (
                        <div
                            key={resource.id}
                            className="bg-card border border-border rounded-lg p-5 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <Avatar className="w-12 h-12">
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {resource.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground">{resource.name}</h3>
                                    <p className="text-sm text-muted-foreground">{resource.experience} experience</p>
                                </div>
                                {resource.status === 'allocated' && (
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-xs rounded flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Allocated
                                    </span>
                                )}
                            </div>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-1.5 mt-4">
                                {resource.skills.map(skill => (
                                    <span
                                        key={skill}
                                        className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                                {resource.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {resource.location}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    Available {formatDistanceToNow(resource.availableFrom, { addSuffix: true })}
                                </span>
                            </div>

                            {resource.lastProject && (
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    Last: {resource.lastProject}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 gap-1.5"
                                    onClick={() => handleContact(resource)}
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    Contact
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleAllocate(resource)}
                                    disabled={resource.status === 'allocated'}
                                >
                                    Allocate
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredResources.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No resources found</p>
                    </div>
                )}

                {/* Add Resource Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Bench Resource</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Full name"
                                        value={newResource.name}
                                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role *</Label>
                                    <Input
                                        id="role"
                                        placeholder="e.g., Java Developer"
                                        value={newResource.role}
                                        onChange={(e) => setNewResource({ ...newResource, role: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@company.com"
                                        value={newResource.email}
                                        onChange={(e) => setNewResource({ ...newResource, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+91 98765 43210"
                                        value={newResource.phone}
                                        onChange={(e) => setNewResource({ ...newResource, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="skills">Skills (comma separated)</Label>
                                <Input
                                    id="skills"
                                    placeholder="React, Node.js, TypeScript"
                                    value={newResource.skills}
                                    onChange={(e) => setNewResource({ ...newResource, skills: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="experience">Experience</Label>
                                    <Input
                                        id="experience"
                                        placeholder="e.g., 5 years"
                                        value={newResource.experience}
                                        onChange={(e) => setNewResource({ ...newResource, experience: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g., Bangalore"
                                        value={newResource.location}
                                        onChange={(e) => setNewResource({ ...newResource, location: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ctc">Expected CTC</Label>
                                    <Input
                                        id="ctc"
                                        placeholder="e.g., 15 LPA"
                                        value={newResource.expectedCTC}
                                        onChange={(e) => setNewResource({ ...newResource, expectedCTC: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastProject">Last Project</Label>
                                    <Input
                                        id="lastProject"
                                        placeholder="Project name"
                                        value={newResource.lastProject}
                                        onChange={(e) => setNewResource({ ...newResource, lastProject: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddResource}>
                                Add Resource
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Contact Dialog */}
                <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Contact {selectedResource?.name}</DialogTitle>
                        </DialogHeader>
                        {selectedResource && (
                            <div className="space-y-4 py-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                                            {selectedResource.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-lg">{selectedResource.name}</h3>
                                        <p className="text-muted-foreground">{selectedResource.role}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-3"
                                        onClick={sendEmail}
                                    >
                                        <Mail className="w-4 h-4 text-primary" />
                                        <div className="text-left">
                                            <p className="font-medium">Send Email</p>
                                            <p className="text-xs text-muted-foreground">{selectedResource.email}</p>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-3"
                                        onClick={callPhone}
                                    >
                                        <Phone className="w-4 h-4 text-green-600" />
                                        <div className="text-left">
                                            <p className="font-medium">Call</p>
                                            <p className="text-xs text-muted-foreground">{selectedResource.phone}</p>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Allocate Dialog */}
                <Dialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Allocate Resource</DialogTitle>
                        </DialogHeader>
                        {selectedResource && (
                            <div className="space-y-4 py-4">
                                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                    <Avatar className="w-12 h-12">
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                            {selectedResource.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">{selectedResource.name}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedResource.role} • {selectedResource.experience}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Select Demand to Allocate</Label>
                                    <Select value={selectedDemandId} onValueChange={setSelectedDemandId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a demand..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {openDemands.map(demand => (
                                                <SelectItem key={demand.id} value={demand.id}>
                                                    <div className="flex flex-col">
                                                        <span>{demand.title}</span>
                                                        <span className="text-xs text-muted-foreground">{demand.location} • {demand.openings} openings</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {openDemands.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-2">
                                        No open demands available for allocation
                                    </p>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAllocateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={confirmAllocate} disabled={!selectedDemandId}>
                                <User className="w-4 h-4 mr-2" />
                                Allocate
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
