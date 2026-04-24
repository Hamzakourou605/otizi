import React from 'react';
import { motion } from 'framer-motion';

export const TransactionSkeleton = () => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-50 mb-2">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 animate-pulse flex-shrink-0"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
      <div className="h-3 bg-slate-100 rounded-full w-1/2 animate-pulse"></div>
    </div>
    <div className="w-16 h-6 bg-slate-100 rounded-full animate-pulse flex-shrink-0"></div>
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm animate-pulse">
    <div className="w-10 h-10 bg-slate-100 rounded-2xl mb-4"></div>
    <div className="h-4 bg-slate-100 rounded-full w-24 mb-3"></div>
    <div className="h-8 bg-slate-100 rounded-full w-40"></div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="h-32 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-96 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse"></div>
      <div className="h-96 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse"></div>
    </div>
  </div>
);
