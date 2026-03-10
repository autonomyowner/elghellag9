// USGS EROS Analysis Component for Agricultural Intelligence
// Displays Landsat satellite data and advanced agricultural analysis

import React, { useState } from 'react';
import { Satellite, TrendingUp, TrendingDown, Minus, Eye, Download, BarChart3, Leaf, Thermometer, Droplets } from 'lucide-react';

interface UsgsErosData {
  imagery: {
    landsat: string;
    ndvi: string;
    thermal: string;
    moisture: string;
  };
  analysis: {
    ndvi: {
      current: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      health: 'excellent' | 'good' | 'fair' | 'poor';
    };
    landUse: {
      type: string;
      confidence: number;
      change: 'positive' | 'negative' | 'stable';
    };
    soilMoisture: {
      level: number;
      status: 'optimal' | 'adequate' | 'low' | 'critical';
    };
    cropHealth: {
      overall: 'excellent' | 'good' | 'fair' | 'poor';
      stressFactors: string[];
      growthStage: string;
    };
  };
  metadata: {
    acquisitionDate: string;
    satellite: string;
    resolution: string;
    cloudCover: number;
  };
}

interface UsgsErosAnalysisProps {
  usgsData: UsgsErosData;
}

const UsgsErosAnalysis: React.FC<UsgsErosAnalysisProps> = ({ usgsData }) => {
  // Add null checks and default values
  const safeData = {
    imagery: usgsData?.imagery || {
      landsat: '',
      ndvi: '',
      thermal: '',
      moisture: ''
    },
    analysis: {
      ndvi: {
        current: usgsData?.analysis?.ndvi?.current || 0.5,
        trend: usgsData?.analysis?.ndvi?.trend || 'stable',
        health: usgsData?.analysis?.ndvi?.health || 'good'
      },
      landUse: {
        type: usgsData?.analysis?.landUse?.type || 'أراضي زراعية',
        confidence: usgsData?.analysis?.landUse?.confidence || 0.8,
        change: usgsData?.analysis?.landUse?.change || 'stable'
      },
      soilMoisture: {
        level: usgsData?.analysis?.soilMoisture?.level || 65,
        status: usgsData?.analysis?.soilMoisture?.status || 'adequate'
      },
      cropHealth: {
        overall: usgsData?.analysis?.cropHealth?.overall || 'good',
        stressFactors: usgsData?.analysis?.cropHealth?.stressFactors || [],
        growthStage: usgsData?.analysis?.cropHealth?.growthStage || 'نمو متوسط'
      }
    },
    metadata: {
      acquisitionDate: usgsData?.metadata?.acquisitionDate || new Date().toISOString(),
      satellite: usgsData?.metadata?.satellite || 'Landsat 8',
      resolution: usgsData?.metadata?.resolution || '30m',
      cloudCover: usgsData?.metadata?.cloudCover || 10
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-emerald-500';
      case 'good': return 'text-green-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <Leaf className="w-5 h-5 text-emerald-500" />;
      case 'good': return <Leaf className="w-5 h-5 text-green-500" />;
      case 'fair': return <Leaf className="w-5 h-5 text-yellow-500" />;
      case 'poor': return <Leaf className="w-5 h-5 text-red-500" />;
      default: return <Leaf className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Simplified USGS EROS Analysis */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Satellite className="w-5 h-5 text-blue-500" />
            تحليل لاندسات
          </h3>
        </div>

        {/* Simple Data Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-500/20 rounded-xl border border-green-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {safeData.analysis.ndvi.current.toFixed(3)}
              </div>
              <div className="text-sm text-gray-300">NDVI</div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {safeData.analysis.soilMoisture.level.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-300">رطوبة التربة</div>
            </div>
          </div>

          <div className="p-4 bg-purple-500/20 rounded-xl border border-purple-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {safeData.analysis.landUse.confidence * 100}%
              </div>
              <div className="text-sm text-gray-300">مستوى الثقة</div>
            </div>
          </div>

          <div className="p-4 bg-orange-500/20 rounded-xl border border-orange-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {safeData.metadata.cloudCover.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-300">غطاء السحب</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsgsErosAnalysis; 