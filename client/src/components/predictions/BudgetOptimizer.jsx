import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Target, AlertCircle, Brain, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Alert, AlertDescription } from '../ui/Alert';
import { Progress } from '../ui/Progress';

const BudgetOptimizer = ({ systemHealth }) => {
  const [formData, setFormData] = useState({
    budget: '',
    timeframe: '30',
    objective: 'revenue',
    currentSpend: {
      meta: '',
      google: '',
      tiktok: '',
      snapchat: ''
    }
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleOptimize = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);

      const requestData = {
        budget: parseFloat(formData.budget),
        timeframe: parseInt(formData.timeframe),
        metrics: {
          objective: formData.objective,
          current_spend: {
            meta: parseFloat(formData.currentSpend.meta) || 0,
            google: parseFloat(formData.currentSpend.google) || 0,
            tiktok: parseFloat(formData.currentSpend.tiktok) || 0,
            snapchat: parseFloat(formData.currentSpend.snapchat) || 0
          }
        }
      };

      const response = await fetch('/api/predictions/budget-optimize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Optimization failed: ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result.prediction);
      setUsingFallback(result.fallback || false);
      
    } catch (err) {
      setError(`Budget optimization failed: ${err.message}`);
      console.error('Budget optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderOptimizationResults = () => {
    if (!prediction) return null;

    const { recommended_allocation, expected_performance, confidence } = prediction;

    return (
      <div className="space-y-6 mt-6">
        {/* Status Banner */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">
                {usingFallback ? 'Fallback Optimization' : 'AI-Powered Optimization'}
              </h3>
              <p className="text-sm text-blue-700">
                {usingFallback 
                  ? 'Using JARVIS fallback due to ML service interruption'
                  : 'Advanced ML algorithm with Pentagon security'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-600" />
            <Badge variant={confidence > 0.8 ? "success" : "warning"}>
              {Math.round(confidence * 100)}% Confidence
            </Badge>
          </div>
        </div>

        {/* Recommended Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Recommended Budget Allocation</span>
            </CardTitle>
            <CardDescription>
              Optimized distribution across advertising platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(recommended_allocation).map(([platform, data]) => (
                <div key={platform} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">{platform}</span>
                    <span className="text-lg font-bold text-green-600">
                      ${data.amount?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <Progress 
                    value={(data.amount / parseFloat(formData.budget)) * 100} 
                    className="h-2"
                  />
                  <div className="text-sm text-gray-600">
                    {data.percentage}% of total budget
                  </div>
                  {data.reasoning && (
                    <div className="text-xs text-gray-500 mt-1">
                      {data.reasoning}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expected Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Expected Performance</span>
            </CardTitle>
            <CardDescription>
              Predicted outcomes with optimized allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${expected_performance.revenue?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">Expected Revenue</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {expected_performance.roas?.toFixed(2) || '0.00'}x
                </div>
                <div className="text-sm text-gray-600">Projected ROAS</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {expected_performance.improvement}
                </div>
                <div className="text-sm text-gray-600">Performance Lift</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {prediction.recommendations && prediction.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Strategic Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prediction.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      {rec.impact && (
                        <Badge variant="outline" className="mt-2">
                          {rec.impact} impact
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-6 h-6" />
            <span>Budget Optimization</span>
          </CardTitle>
          <CardDescription>
            AI-powered budget allocation across advertising platforms with JARVIS failover protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Budget Input */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Total Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="10000"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe (days)</Label>
              <Select 
                value={formData.timeframe} 
                onValueChange={(value) => handleInputChange('timeframe', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Objective Selection */}
          <div className="space-y-2">
            <Label htmlFor="objective">Optimization Objective</Label>
            <Select 
              value={formData.objective} 
              onValueChange={(value) => handleInputChange('objective', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Maximize Revenue</SelectItem>
                <SelectItem value="roas">Maximize ROAS</SelectItem>
                <SelectItem value="conversions">Maximize Conversions</SelectItem>
                <SelectItem value="reach">Maximize Reach</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Spend */}
          <div className="space-y-3">
            <Label>Current Platform Spend (Optional)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Meta/Facebook ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.currentSpend.meta}
                  onChange={(e) => handleInputChange('currentSpend.meta', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Google Ads ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.currentSpend.google}
                  onChange={(e) => handleInputChange('currentSpend.google', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">TikTok Ads ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.currentSpend.tiktok}
                  onChange={(e) => handleInputChange('currentSpend.tiktok', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Snapchat Ads ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.currentSpend.snapchat}
                  onChange={(e) => handleInputChange('currentSpend.snapchat', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Optimize Button */}
          <Button 
            onClick={handleOptimize}
            disabled={!formData.budget || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Optimizing with AI...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Optimize Budget Allocation
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {renderOptimizationResults()}
    </div>
  );
};

export default BudgetOptimizer;