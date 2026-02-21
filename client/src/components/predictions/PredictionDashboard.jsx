import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, BarChart3, TrendingUp, DollarSign, Users, Zap, Shield, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Badge } from '../ui/Badge';
import { Alert, AlertDescription } from '../ui/Alert';
import BudgetOptimizer from './BudgetOptimizer';
import CustomerPurchase from './CustomerPurchase';
import ProductVelocity from './ProductVelocity';
import CreativeFatigue from './CreativeFatigue';
import CrossMerchantInsights from './CrossMerchantInsights';

const PredictionDashboard = () => {
  const [activeTab, setActiveTab] = useState('budget');
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check system health on component mount
  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/predictions/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      const health = await response.json();
      setSystemHealth(health);
      setError(null);
    } catch (err) {
      setError(`System health check failed: ${err.message}`);
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderHealthStatus = () => {
    if (!systemHealth) return null;

    const { models, jarvis } = systemHealth;
    const modelNames = Object.keys(models);
    const healthyModels = modelNames.filter(name => models[name]?.status === 'healthy').length;
    const jarvisHealthy = jarvis?.error_recovery && jarvis?.context_manager;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>AI System Status</span>
            {jarvisHealthy && <Badge variant="success">JARVIS Active</Badge>}
          </CardTitle>
          <CardDescription>
            Real-time status of ML models and AI failover systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="text-sm">ML Models</span>
              <Badge variant={healthyModels === modelNames.length ? "success" : "warning"}>
                {healthyModels}/{modelNames.length}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm">Pentagon Security</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">JARVIS Failover</span>
              <Badge variant={jarvisHealthy ? "success" : "error"}>
                {jarvisHealthy ? "Ready" : "Offline"}
              </Badge>
            </div>
          </div>
          
          {!jarvisHealthy && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                JARVIS failover system is not fully operational. Some predictions may have reduced reliability.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Initializing AI systems...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="max-w-2xl mx-auto mt-8" variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkSystemHealth}
            className="ml-4"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Predictions</h1>
          <p className="text-gray-600 mt-1">
            Advanced ML predictions with JARVIS failover and Pentagon security
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={checkSystemHealth}
          className="flex items-center space-x-2"
        >
          <Brain className="w-4 h-4" />
          <span>System Check</span>
        </Button>
      </div>

      {/* System Health Status */}
      {renderHealthStatus()}

      {/* Prediction Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="budget" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Budget</span>
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Customer</span>
          </TabsTrigger>
          <TabsTrigger value="product" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Product</span>
          </TabsTrigger>
          <TabsTrigger value="creative" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Creative</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="mt-6">
          <BudgetOptimizer systemHealth={systemHealth} />
        </TabsContent>

        <TabsContent value="customer" className="mt-6">
          <CustomerPurchase systemHealth={systemHealth} />
        </TabsContent>

        <TabsContent value="product" className="mt-6">
          <ProductVelocity systemHealth={systemHealth} />
        </TabsContent>

        <TabsContent value="creative" className="mt-6">
          <CreativeFatigue systemHealth={systemHealth} />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <CrossMerchantInsights systemHealth={systemHealth} />
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Pentagon Security Enabled</span>
              </div>
              <div className="flex items-center space-x-1">
                <Brain className="w-3 h-3" />
                <span>JARVIS AI Failover Ready</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Real-time ML Processing</span>
              </div>
            </div>
            <div>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionDashboard;