from fastapi import APIRouter, HTTPException
from app.data import demo_data
from app.models.schemas import BlockWeather

router = APIRouter(prefix="/api/blocks", tags=["blocks"])


@router.get("", response_model=list, summary="List all blocks (currently just the one demo block)")
def list_blocks():
    return [
        {
            "district": demo_data.BLOCK["district"],
            "block": demo_data.BLOCK["block"],
            "center": demo_data.BLOCK["center"],
        }
    ]


@router.get("/{block_name}", response_model=BlockWeather, summary="Get a specific block's current weather")
def get_block(block_name: str):
    if block_name.lower() != demo_data.BLOCK["block"].lower():
        raise HTTPException(status_code=404, detail=f"Block '{block_name}' not found in this demo deployment")
    return BlockWeather(**demo_data.BLOCK)
