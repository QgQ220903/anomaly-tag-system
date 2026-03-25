// src/pages/supervisor/AllTagsList.tsx
import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Home,
    Search,
    Eye,
    UserPlus,
    CheckSquare,
    Clock,
    AlertCircle,
    X,
    ArrowUpDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { mockTags, mockUsers } from '@/lib/mockData';
import { PRIORITY_CONFIG, STATUS_CONFIG, PILLAR_CONFIG, type Pillar } from '@/types';

type SortField = 'createdAt' | 'priority' | 'status' | 'tagId';
type SortOrder = 'asc' | 'desc';

export const AllTagsList: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const filterParam = searchParams.get('filter');

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [pillarFilter, setPillarFilter] = useState<string>('all');
    const [assignedFilter, setAssignedFilter] = useState<string>('all');

    // Sort states
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Selection states
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Get unique categories from mock data
    const categories = useMemo(() => {
        const cats = new Set(mockTags.map(t => t.categoryName).filter((name): name is string => !!name));
        return Array.from(cats);
    }, []);

    // Get unique pillars
    const pillars: Pillar[] = ['Safety', 'Quality', 'Delivery', 'Cost', 'Morale', 'Environment'];

    // Maintenance users for assign filter
    const maintenanceUsers = mockUsers.filter(u => u.role === 'Maintenance Supervisor');

    // Filter and sort tags
    const filteredTags = useMemo(() => {
        let filtered = mockTags;

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(tag =>
                tag.tagId.toLowerCase().includes(term) ||
                tag.description.toLowerCase().includes(term) ||
                tag.machineName?.toLowerCase().includes(term) ||
                tag.createdByUserName?.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(tag => tag.status === statusFilter);
        }

        // Priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(tag => tag.priority === priorityFilter);
        }

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(tag => tag.categoryName === categoryFilter);
        }

        // Pillar filter
        if (pillarFilter !== 'all') {
            filtered = filtered.filter(tag => tag.pillar === pillarFilter);
        }

        // Assigned filter
        if (assignedFilter !== 'all') {
            if (assignedFilter === 'unassigned') {
                filtered = filtered.filter(tag => !tag.assignedTo);
            } else {
                filtered = filtered.filter(tag => tag.assignedTo === assignedFilter);
            }
        }

        // Apply critical filter from URL param
        if (filterParam === 'critical') {
            filtered = filtered.filter(tag => tag.priority === 'Critical' && tag.status !== 'Closed' && tag.status !== 'Completed');
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal: any, bVal: any;
            switch (sortField) {
                case 'createdAt':
                    aVal = new Date(a.createdAt).getTime();
                    bVal = new Date(b.createdAt).getTime();
                    break;
                case 'priority':
                    const priorityOrder = { Critical: 1, High: 2, Medium: 3, Low: 4 };
                    aVal = a.priority ? priorityOrder[a.priority] : 99;
                    bVal = b.priority ? priorityOrder[b.priority] : 99;
                    break;
                case 'status':
                    const statusOrder = { Open: 1, 'In Progress': 2, 'Pending Parts': 3, Completed: 4, Closed: 5 };
                    aVal = statusOrder[a.status] || 99;
                    bVal = statusOrder[b.status] || 99;
                    break;
                case 'tagId':
                    aVal = a.tagId;
                    bVal = b.tagId;
                    break;
                default:
                    aVal = a.createdAt;
                    bVal = b.createdAt;
            }
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }, [searchTerm, statusFilter, priorityFilter, categoryFilter, pillarFilter, assignedFilter, sortField, sortOrder, filterParam]);

    // Pagination
    const totalPages = Math.ceil(filteredTags.length / itemsPerPage);
    const paginatedTags = filteredTags.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Active filters count
    const activeFiltersCount = [
        statusFilter !== 'all',
        priorityFilter !== 'all',
        categoryFilter !== 'all',
        pillarFilter !== 'all',
        assignedFilter !== 'all'
    ].filter(Boolean).length;

    const clearAllFilters = () => {
        setStatusFilter('all');
        setPriorityFilter('all');
        setCategoryFilter('all');
        setPillarFilter('all');
        setAssignedFilter('all');
        setSearchTerm('');
    };

    const getDaysOpen = (createdAt: string, status: string) => {
        if (status === 'Closed' || status === 'Completed') return null;
        const created = new Date(createdAt);
        const now = new Date();
        const diffDays = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getSLADays = (priority?: string) => {
        switch (priority) {
            case 'Critical': return 1;
            case 'High': return 2;
            case 'Medium': return 3;
            case 'Low': return 5;
            default: return 99;
        }
    };

    const isNearSLA = (createdAt: string, priority?: string, status?: string) => {
        if (status === 'Closed' || status === 'Completed') return false;
        const daysOpen = getDaysOpen(createdAt, status || '');
        const slaDays = getSLADays(priority);
        return daysOpen !== null && daysOpen >= slaDays - 1 && daysOpen < slaDays;
    };

    const isOverdue = (createdAt: string, priority?: string, status?: string) => {
        if (status === 'Closed' || status === 'Completed') return false;
        const daysOpen = getDaysOpen(createdAt, status || '');
        const slaDays = getSLADays(priority);
        return daysOpen !== null && daysOpen > slaDays;
    };

    const toggleSelectAll = () => {
        if (selectedTags.length === paginatedTags.length) {
            setSelectedTags([]);
        } else {
            setSelectedTags(paginatedTags.map(t => t.id));
        }
    };

    const toggleSelectTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const handleBulkAssign = () => {
        alert(`Assign ${selectedTags.length} selected tags to maintenance team`);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1" />;
        return <ArrowUpDown className={`w-3 h-3 ml-1 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />;
    };

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link to="/supervisor/dashboard" className="flex items-center gap-1 hover:text-orange-500">
                            <Home className="w-4 h-4" />
                            <span>Dashboard</span>
                        </Link>
                        <span>/</span>
                        <span className="text-gray-400">All Tags</span>
                    </nav>
                    <h1 className="text-2xl font-bold">All Anomaly Tags</h1>
                    <p className="text-gray-500 mt-1">Complete tag list across all production areas</p>
                </div>

                {/* Filter Card */}
                <Card>
                    <CardContent className="p-5 space-y-5">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search Tag ID, description, machine, reporter..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11"
                            />
                        </div>


                        {/* Filter Row - Wider spacing with consistent width */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-10 w-full">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Open">Open</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Pending Parts">Pending Parts</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="h-10 w-full">
                                    <SelectValue placeholder="All Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="h-10 w-full">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={pillarFilter} onValueChange={setPillarFilter}>
                                <SelectTrigger className="h-10 w-full">
                                    <SelectValue placeholder="All Pillars" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Pillars</SelectItem>
                                    {pillars.map(pillar => (
                                        <SelectItem key={pillar} value={pillar}>{pillar}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                                <SelectTrigger className="h-10 w-full">
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {maintenanceUsers.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Active Filters */}
                        {activeFiltersCount > 0 && (
                            <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                                <span className="text-xs text-gray-500">Active filters:</span>
                                {statusFilter !== 'all' && (
                                    <Badge variant="secondary" className="gap-1">
                                        Status: {statusFilter}
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
                                    </Badge>
                                )}
                                {priorityFilter !== 'all' && (
                                    <Badge variant="secondary" className="gap-1">
                                        Priority: {priorityFilter}
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => setPriorityFilter('all')} />
                                    </Badge>
                                )}
                                {categoryFilter !== 'all' && (
                                    <Badge variant="secondary" className="gap-1">
                                        Category: {categoryFilter}
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => setCategoryFilter('all')} />
                                    </Badge>
                                )}
                                {pillarFilter !== 'all' && (
                                    <Badge variant="secondary" className="gap-1">
                                        Pillar: {pillarFilter}
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => setPillarFilter('all')} />
                                    </Badge>
                                )}
                                {assignedFilter !== 'all' && assignedFilter !== 'unassigned' && (
                                    <Badge variant="secondary" className="gap-1">
                                        Assigned: {mockUsers.find(u => u.id === assignedFilter)?.name}
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => setAssignedFilter('all')} />
                                    </Badge>
                                )}
                                {assignedFilter === 'unassigned' && (
                                    <Badge variant="secondary" className="gap-1">
                                        Assigned: Unassigned
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => setAssignedFilter('all')} />
                                    </Badge>
                                )}
                                <button onClick={clearAllFilters} className="text-xs text-orange-500 hover:underline">
                                    Clear all
                                </button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bulk Action Bar */}
                {selectedTags.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center justify-between animate-in fade-in-50">
                        <span className="text-sm font-medium">{selectedTags.length} tags selected</span>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleBulkAssign} className="bg-orange-500 hover:bg-orange-600">
                                Assign Selected
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])}>
                                Clear Selection
                            </Button>
                        </div>
                    </div>
                )}

                {/* Table Card */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr className="text-left text-sm font-medium text-gray-600">
                                    <th className="px-4 py-4 w-10">
                                        <Checkbox
                                            checked={selectedTags.length === paginatedTags.length && paginatedTags.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-4 cursor-pointer hover:text-gray-900" onClick={() => handleSort('tagId')}>
                                        <div className="flex items-center">Tag ID {getSortIcon('tagId')}</div>
                                    </th>
                                    <th className="px-4 py-4">Category</th>
                                    <th className="px-4 py-4">Machine</th>
                                    <th className="px-4 py-4 cursor-pointer hover:text-gray-900" onClick={() => handleSort('priority')}>
                                        <div className="flex items-center">Priority {getSortIcon('priority')}</div>
                                    </th>
                                    <th className="px-4 py-4 cursor-pointer hover:text-gray-900" onClick={() => handleSort('status')}>
                                        <div className="flex items-center">Status {getSortIcon('status')}</div>
                                    </th>
                                    <th className="px-4 py-4">Pillar</th>
                                    <th className="px-4 py-4">Assigned To</th>
                                    <th className="px-4 py-4 cursor-pointer hover:text-gray-900" onClick={() => handleSort('createdAt')}>
                                        <div className="flex items-center">Created {getSortIcon('createdAt')}</div>
                                    </th>
                                    <th className="px-4 py-4">Days Open</th>
                                    <th className="px-4 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTags.map((tag) => {
                                    const daysOpen = getDaysOpen(tag.createdAt, tag.status);
                                    const overdue = isOverdue(tag.createdAt, tag.priority, tag.status);
                                    const nearSLA = isNearSLA(tag.createdAt, tag.priority, tag.status);

                                    return (
                                        <tr key={tag.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <Checkbox
                                                    checked={selectedTags.includes(tag.id)}
                                                    onCheckedChange={() => toggleSelectTag(tag.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => navigate(`/supervisor/tags/${tag.id}/assign`)}
                                                    className="font-mono text-sm text-orange-600 hover:text-orange-700 hover:underline"
                                                >
                                                    {tag.tagId}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{tag.categoryName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{tag.machineName}</td>
                                            <td className="px-4 py-3">
                                                {tag.priority ? (
                                                    <Badge className={PRIORITY_CONFIG[tag.priority].bgColor}>
                                                        <span className={PRIORITY_CONFIG[tag.priority].color}>
                                                            {tag.priority}
                                                        </span>
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge className={STATUS_CONFIG[tag.status].bgColor}>
                                                    <span className={STATUS_CONFIG[tag.status].color}>
                                                        {tag.status}
                                                    </span>
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                {tag.pillar ? (
                                                    <Badge className={PILLAR_CONFIG[tag.pillar].bgColor}>
                                                        <span className={PILLAR_CONFIG[tag.pillar].color}>
                                                            {tag.pillar}
                                                        </span>
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {tag.assignedToUserName || <span className="text-gray-400">Unassigned</span>}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {new Date(tag.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                {daysOpen !== null ? (
                                                    <div className="flex items-center gap-1">
                                                        {overdue && <AlertCircle className="w-3 h-3 text-red-500" />}
                                                        {nearSLA && !overdue && <Clock className="w-3 h-3 text-amber-500" />}
                                                        <span className={`text-sm ${overdue ? 'text-red-600 font-bold' : nearSLA ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                                                            {daysOpen}d
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => navigate(`/supervisor/tags/${tag.id}/assign`)}
                                                                className="text-gray-500 hover:text-orange-500"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>View tag details</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {!tag.assignedTo && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => navigate(`/supervisor/tags/${tag.id}/assign`)}
                                                                    className="text-gray-500 hover:text-orange-500"
                                                                >
                                                                    <UserPlus className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Assign to maintenance</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}

                                                    {tag.status === 'Completed' && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-gray-500 hover:text-green-500"
                                                                >
                                                                    <CheckSquare className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Verify and close</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredTags.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t bg-white">
                            <div className="text-sm text-gray-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTags.length)} of {filteredTags.length} tags
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    isActive={currentPage === pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </Card>
            </div>
        </TooltipProvider>
    );
};