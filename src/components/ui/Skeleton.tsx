import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="p-4 flex items-center gap-4 border-b border-slate-50">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function VisitorsListSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Visitante</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Documento</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Categoria</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}