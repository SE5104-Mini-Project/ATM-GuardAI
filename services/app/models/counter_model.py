from app.database import db

async def get_next_id(counter_name: str):
    counter = await db.counter.find_one_and_update(
        {"name": counter_name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    seq = str(counter["seq"]).zfill(2)
    return f"{counter_name}_{seq}"
