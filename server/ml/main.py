"""
Slay Season Prediction Engine - Main API
Advanced ML predictions that give merchants a competitive edge
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import uvicorn
import logging
from datetime import datetime, timedelta
import os

# Import prediction models
from models.creative_fatigue import CreativeFatiguePredictor
from models.budget_optimizer import BudgetOptimizer
from models.customer_purchase import CustomerPurchasePredictor
from models.product_velocity import ProductVelocityPredictor
from models.cross_merchant import CrossMerchantIntelligence

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Slay Season Prediction Engine",
    description="Advanced ML predictions for e-commerce dominance",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize prediction models
creative_predictor = CreativeFatiguePredictor()
budget_optimizer = BudgetOptimizer()
customer_predictor = CustomerPurchasePredictor()
product_predictor = ProductVelocityPredictor()
merchant_intelligence = CrossMerchantIntelligence()

# Pydantic models for API requests
class CreativeFatigueRequest(BaseModel):
    creative_id: str
    platform: str
    current_metrics: Dict[str, float]
    historical_data: List[Dict[str, Any]]

class BudgetOptimizationRequest(BaseModel):
    current_spend: float
    current_revenue: float
    historical_performance: List[Dict[str, Any]]
    constraints: Optional[Dict[str, Any]] = None

class CustomerPredictionRequest(BaseModel):
    customer_id: str
    purchase_history: List[Dict[str, Any]]
    behavior_data: Optional[Dict[str, Any]] = None

class ProductVelocityRequest(BaseModel):
    product_id: str
    product_data: Dict[str, Any]
    market_data: Optional[List[Dict[str, Any]]] = None

class CrossMerchantRequest(BaseModel):
    merchant_profile: Dict[str, Any]
    benchmark_categories: List[str]

# Response models
class PredictionResponse(BaseModel):
    prediction: Any
    confidence_score: float
    explanation: str
    recommended_actions: List[str]
    timestamp: datetime

@app.get("/")
async def root():
    return {
        "message": "Slay Season Prediction Engine",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": [
            "/creative-fatigue",
            "/budget-optimization", 
            "/customer-prediction",
            "/product-velocity",
            "/cross-merchant-intelligence",
            "/health"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "models_loaded": {
            "creative_fatigue": creative_predictor.is_ready(),
            "budget_optimizer": budget_optimizer.is_ready(),
            "customer_prediction": customer_predictor.is_ready(),
            "product_velocity": product_predictor.is_ready(),
            "cross_merchant": merchant_intelligence.is_ready()
        }
    }

@app.post("/creative-fatigue", response_model=PredictionResponse)
async def predict_creative_fatigue(request: CreativeFatigueRequest):
    """
    Predict when ad creative will hit fatigue
    Returns: Days until fatigue + confidence score
    """
    try:
        result = creative_predictor.predict_fatigue(
            request.creative_id,
            request.platform,
            request.current_metrics,
            request.historical_data
        )
        
        return PredictionResponse(
            prediction=f"Creative will hit fatigue in {result['days_to_fatigue']} days",
            confidence_score=result['confidence'],
            explanation=result['explanation'],
            recommended_actions=result['actions'],
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"Creative fatigue prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/budget-optimization", response_model=PredictionResponse)
async def optimize_budget(request: BudgetOptimizationRequest):
    """
    Recommend optimal budget allocation
    Returns: Budget changes + expected revenue impact
    """
    try:
        result = budget_optimizer.optimize(
            request.current_spend,
            request.current_revenue,
            request.historical_performance,
            request.constraints
        )
        
        return PredictionResponse(
            prediction=f"Increase budget by ${result['budget_change']:,.0f} → +{result['revenue_increase']:.0%} revenue",
            confidence_score=result['confidence'],
            explanation=result['explanation'],
            recommended_actions=result['actions'],
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"Budget optimization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/customer-prediction", response_model=PredictionResponse)
async def predict_customer_purchase(request: CustomerPredictionRequest):
    """
    Predict when customer will make next purchase
    Returns: Purchase probability + timing prediction
    """
    try:
        result = customer_predictor.predict_next_purchase(
            request.customer_id,
            request.purchase_history,
            request.behavior_data
        )
        
        return PredictionResponse(
            prediction=f"Customer will reorder in {result['days_to_purchase']} days",
            confidence_score=result['confidence'],
            explanation=result['explanation'],
            recommended_actions=result['actions'],
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"Customer prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/product-velocity", response_model=PredictionResponse)
async def predict_product_velocity(request: ProductVelocityRequest):
    """
    Predict product trend velocity
    Returns: Expected demand change + trend direction
    """
    try:
        result = product_predictor.predict_velocity(
            request.product_id,
            request.product_data,
            request.market_data
        )
        
        return PredictionResponse(
            prediction=f"Product will trend {result['direction']} {result['velocity_change']:.0%} in next {result['timeframe']}",
            confidence_score=result['confidence'],
            explanation=result['explanation'],
            recommended_actions=result['actions'],
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"Product velocity prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cross-merchant-intelligence", response_model=PredictionResponse)
async def cross_merchant_insights(request: CrossMerchantRequest):
    """
    Provide cross-merchant intelligence and benchmarks
    Returns: Comparative insights + opportunity recommendations
    """
    try:
        result = merchant_intelligence.get_insights(
            request.merchant_profile,
            request.benchmark_categories
        )
        
        return PredictionResponse(
            prediction=f"Stores like yours see {result['opportunity_metric']} when implementing {result['top_opportunity']}",
            confidence_score=result['confidence'],
            explanation=result['explanation'],
            recommended_actions=result['actions'],
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"Cross-merchant intelligence failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Batch prediction endpoint
@app.post("/batch-predictions")
async def batch_predictions(merchant_data: Dict[str, Any]):
    """
    Get all predictions for a merchant in one call
    Optimized for dashboard integration
    """
    try:
        predictions = {}
        
        # Run all predictions if data is available
        if "creative_data" in merchant_data:
            predictions["creative_fatigue"] = await predict_creative_fatigue(
                CreativeFatigueRequest(**merchant_data["creative_data"])
            )
            
        if "budget_data" in merchant_data:
            predictions["budget_optimization"] = await optimize_budget(
                BudgetOptimizationRequest(**merchant_data["budget_data"])
            )
            
        if "customer_data" in merchant_data:
            predictions["customer_predictions"] = [
                await predict_customer_purchase(
                    CustomerPredictionRequest(**customer)
                ) for customer in merchant_data["customer_data"]
            ]
            
        if "product_data" in merchant_data:
            predictions["product_velocity"] = [
                await predict_product_velocity(
                    ProductVelocityRequest(**product)
                ) for product in merchant_data["product_data"]
            ]
            
        if "merchant_profile" in merchant_data:
            predictions["cross_merchant"] = await cross_merchant_insights(
                CrossMerchantRequest(**merchant_data["merchant_profile"])
            )
            
        return {
            "predictions": predictions,
            "generated_at": datetime.now(),
            "summary": f"Generated {len(predictions)} prediction types"
        }
        
    except Exception as e:
        logger.error(f"Batch predictions failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)