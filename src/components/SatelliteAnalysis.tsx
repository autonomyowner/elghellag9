// Satellite Analysis Component for Agricultural Intelligence
// Displays Sentinel Hub satellite imagery and NDVI analysis

import React, { useState } from 'react';
import { Satellite, TrendingUp, TrendingDown, Minus, Eye, Download, BarChart3, Leaf } from 'lucide-react';

interface SentinelData {
  imagery: {
    rgb: string;
    ndvi: string;
    moisture: string;
    chlorophyll: string;
  };
  ndvi: {
    current: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    health: 'excellent' | 'good' | 'fair' | 'poor';
  };
  vegetation: {
    density: number;
    health: 'excellent' | 'good' | 'fair' | 'poor';
    stressFactors: string[];
    growthStage: string;
  };
  landUse: {
    type: string;
    confidence: number;
    area: number;
    change: 'positive' | 'negative' | 'stable';
  };
}

interface SatelliteAnalysisProps {
  sentinelData: SentinelData;
}

const SatelliteAnalysis: React.FC<SatelliteAnalysisProps> = ({ sentinelData }) => {
  // Add null checks and default values
  const safeData = {
    imagery: sentinelData?.imagery || {
      rgb: '',
      ndvi: '',
      moisture: '',
      chlorophyll: ''
    },
    ndvi: {
      current: sentinelData?.ndvi?.current || 0.5,
      average: sentinelData?.ndvi?.average || 0.5,
      trend: sentinelData?.ndvi?.trend || 'stable',
      health: sentinelData?.ndvi?.health || 'good'
    },
    vegetation: {
      density: sentinelData?.vegetation?.density || 75,
      health: sentinelData?.vegetation?.health || 'good',
      stressFactors: sentinelData?.vegetation?.stressFactors || [],
      growthStage: sentinelData?.vegetation?.growthStage || 'نمو متوسط'
    },
    landUse: {
      type: sentinelData?.landUse?.type || 'أراضي زراعية',
      confidence: sentinelData?.landUse?.confidence || 0.8,
      area: sentinelData?.landUse?.area || 100,
      change: sentinelData?.landUse?.change || 'stable'
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'fair':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
        return <Leaf className="w-4 h-4 text-green-400" />;
      case 'good':
        return <Leaf className="w-4 h-4 text-blue-400" />;
      case 'fair':
        return <Leaf className="w-4 h-4 text-yellow-400" />;
      case 'poor':
        return <Leaf className="w-4 h-4 text-red-400" />;
      default:
        return <Leaf className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Simplified Satellite Analysis Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Satellite className="w-5 h-5 text-blue-500" />
            تحليل الأقمار الصناعية
          </h3>
        </div>

        {/* Simple Data Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/20 rounded-xl border border-green-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {(safeData.ndvi.current * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-300">NDVI</div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {safeData.vegetation.density.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-300">كثافة النباتات</div>
            </div>
          </div>

          <div className="p-4 bg-purple-500/20 rounded-xl border border-purple-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {safeData.landUse.confidence * 100}%
              </div>
              <div className="text-sm text-gray-300">مستوى الثقة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteAnalysis; 