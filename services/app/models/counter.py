from app.database import db

async def get_next_user_id():
    counter = await db.counter.find_one_and_update(
        {"name": "user"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    seq = str(counter["seq"]).zfill(2)
    return f"user_{seq}"
