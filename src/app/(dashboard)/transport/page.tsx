'use client';

import { useState } from 'react';
import { Bus, MapPin, Users, Phone, CheckCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/layout/Breadcrumb';

type RouteStatus = 'Not Started' | 'In Transit' | 'Completed';

interface BusRoute {
  id: string;
  routeNo: number;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  students: number;
  stops: string[];
  status: RouteStatus;
}

const initialRoutes: BusRoute[] = [
  {
    id: 'r1', routeNo: 1, busNumber: 'MH12-AB-1234', driverName: 'Ramesh Pawar', driverPhone: '+91 98234 00011',
    students: 42, status: 'Completed',
    stops: ['School', 'Kothrud Depot', 'Dahanukar Colony', 'Karve Nagar', 'Warje'],
  },
  {
    id: 'r2', routeNo: 2, busNumber: 'MH12-CD-5678', driverName: 'Suresh Kale', driverPhone: '+91 98234 00012',
    students: 38, status: 'In Transit',
    stops: ['School', 'Deccan Gymkhana', 'JM Road', 'FC Road', 'Shivajinagar', 'Aundh'],
  },
  {
    id: 'r3', routeNo: 3, busNumber: 'MH12-EF-9012', driverName: 'Prakash Jadhav', driverPhone: '+91 98234 00013',
    students: 35, status: 'In Transit',
    stops: ['School', 'Baner Road', 'Baner', 'Balewadi', 'Wakad', 'Hinjewadi Phase 1'],
  },
  {
    id: 'r4', routeNo: 4, busNumber: 'MH12-GH-3456', driverName: 'Vijay Mane', driverPhone: '+91 98234 00014',
    students: 44, status: 'Not Started',
    stops: ['School', 'Hadapsar', 'Magarpatta', 'Kharadi', 'Wagholi'],
  },
  {
    id: 'r5', routeNo: 5, busNumber: 'MH12-IJ-7890', driverName: 'Ganesh Shinde', driverPhone: '+91 98234 00015',
    students: 29, status: 'Not Started',
    stops: ['School', 'Swargate', 'Bibwewadi', 'Kondhwa', 'Undri'],
  },
  {
    id: 'r6', routeNo: 6, busNumber: 'MH12-KL-1122', driverName: 'Dnyaneshwar Patil', driverPhone: '+91 98234 00016',
    students: 33, status: 'Completed',
    stops: ['School', 'Viman Nagar', 'Kalyani Nagar', 'Nagar Road', 'Pune Airport Area', 'Lohegaon'],
  },
  {
    id: 'r7', routeNo: 7, busNumber: 'MH12-MN-3344', driverName: 'Mohan Salve', driverPhone: '+91 98234 00017',
    students: 51, status: 'Not Started',
    stops: ['School', 'Sinhagad Road', 'Anandnagar', 'Dhayari', 'Narhe', 'Ambegaon'],
  },
  {
    id: 'r8', routeNo: 8, busNumber: 'MH12-OP-5566', driverName: 'Santosh Bhosle', driverPhone: '+91 98234 00018',
    students: 27, status: 'In Transit',
    stops: ['School', 'Camp', 'Boat Club Road', 'Sangam Bridge', 'Erandwane', 'Prabhat Road'],
  },
];

export default function TransportPage() {
  const [routes, setRoutes] = useState<BusRoute[]>(initialRoutes);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  const startJourney = (routeId: string, routeNo: number) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, status: 'In Transit' } : r));
    toast.success(`Route ${routeNo} journey started — parents notified, bus has departed`);
  };

  const endJourney = (routeId: string, routeNo: number) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, status: 'Completed' } : r));
    toast.success(`Route ${routeNo} completed — all parents notified`);
  };

  const getStatusBadge = (status: RouteStatus) => {
    if (status === 'Completed') return <Badge variant="success">Completed</Badge>;
    if (status === 'In Transit') return <Badge variant="warning">In Transit</Badge>;
    return <Badge variant="secondary">Not Started</Badge>;
  };

  const getStatusBorder = (status: RouteStatus) => {
    if (status === 'Completed') return 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10';
    if (status === 'In Transit') return 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10';
    return 'border-border bg-background';
  };

  const notStarted = routes.filter(r => r.status === 'Not Started').length;
  const inTransit = routes.filter(r => r.status === 'In Transit').length;
  const completed = routes.filter(r => r.status === 'Completed').length;
  const totalStudents = routes.reduce((a, b) => a + b.students, 0);

  return (
    <div className="page-enter">
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Transport Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor bus routes and notify parents in real-time
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today: 12/03/2026 · Morning Route</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Bus, label: 'Total Routes', value: routes.length, color: 'bg-blue-500', light: 'from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20' },
          { icon: PlayCircle, label: 'In Transit', value: inTransit, color: 'bg-amber-500', light: 'from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20' },
          { icon: CheckCircle, label: 'Completed', value: completed, color: 'bg-emerald-500', light: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20' },
          { icon: Users, label: 'Total Students', value: totalStudents, color: 'bg-purple-500', light: 'from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20' },
        ].map(s => (
          <Card key={s.label} className={`border-0 shadow-sm bg-gradient-to-br ${s.light}`}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {routes.map(route => (
          <Card key={route.id} className={`border-2 transition-all ${getStatusBorder(route.status)}`}>
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    route.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/40'
                    : route.status === 'In Transit' ? 'bg-amber-100 dark:bg-amber-900/40'
                    : 'bg-slate-100 dark:bg-slate-800/40'
                  }`}>
                    <Bus className={`w-6 h-6 ${
                      route.status === 'Completed' ? 'text-emerald-600'
                      : route.status === 'In Transit' ? 'text-amber-600'
                      : 'text-slate-500'
                    }`} />
                  </div>
                  <div>
                    <p className="font-bold text-base">Route {route.routeNo}</p>
                    <p className="text-xs text-muted-foreground">{route.busNumber}</p>
                  </div>
                </div>
                {getStatusBadge(route.status)}
              </div>

              {/* Driver info */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground font-medium">{route.driverName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{route.driverPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{route.students} students aboard</span>
                </div>
              </div>

              {/* Stops (collapsible) */}
              <button
                onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
              >
                <MapPin className="w-3.5 h-3.5" />
                {route.stops.length} stops — {expandedRoute === route.id ? 'Hide' : 'Show'} route
              </button>

              {expandedRoute === route.id && (
                <div className="mb-3 space-y-1">
                  {route.stops.map((stop, i) => (
                    <div key={stop} className="flex items-center gap-2 text-xs">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        i === 0 ? 'bg-emerald-500 text-white'
                        : i === route.stops.length - 1 ? 'bg-rose-500 text-white'
                        : 'bg-muted text-muted-foreground'
                      }`}>
                        {i === 0 ? 'S' : i === route.stops.length - 1 ? 'E' : i}
                      </div>
                      <span className={i === 0 || i === route.stops.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                        {stop}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {route.status === 'Not Started' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs"
                    onClick={() => startJourney(route.id, route.routeNo)}
                  >
                    <PlayCircle className="w-3.5 h-3.5" /> Journey Started
                  </Button>
                )}
                {route.status === 'In Transit' && (
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white"
                    onClick={() => endJourney(route.id, route.routeNo)}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Journey Ended
                  </Button>
                )}
                {route.status === 'Completed' && (
                  <div className="flex-1 flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium py-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> All parents notified
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1"
                  onClick={() => toast.info(`Calling ${route.driverName}...`)}
                >
                  <Phone className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
