import os
import subprocess
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import Field, Session, SQLModel, create_engine, select

app = FastAPI()

# allows the browser to fetch resources from the this API server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# serves the splats from the filesystem so that the frontend can access them for display and download
app.mount("/static/splats", StaticFiles(directory="./splats"), name="splats")


SQLACLHEMY_DATABASE_URL = "sqlite:///./splats.db"
# Creates the database engine for connecting to the SQLite database specified by the URL. This engine will be used to execute SQL commands and manage database connections throughout the application.
engine = create_engine(SQLACLHEMY_DATABASE_URL)


# Define the Splat model for the database ie: sqlite table for storing the splat generation information
class Splat(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    filename: str
    input_path: str
    output_path: str


def init_db():
    """
    Initializes the database by creating the 'splats' table if it doesn't already exist.
    """
    SQLModel.metadata.create_all(engine)


def generate_splat(splat_id: str):
    """Run's the Sharp CLI tool to process the input image the CLI was installed in ./sharp directory"""

    subprocess.run(
        [
            "sharp",
            "predict",
            "-i",
            f"./splats/{splat_id}/input/image.png",
            "-o",
            f"./splats/{splat_id}/output",
            "-c",
            "./models/sharp_2572gikvuh.pt",
        ]
    )


# Listens to when the FastAPI application starts
@app.on_event("startup")
def on_startup():
    """Initialize the database connection and create tables if they don't exist."""
    init_db()


@app.get("/")
def hello_world():
    """A simple endpoint to verify the API server is working"""
    return {"hello": "world"}


@app.get("/splats")
def get_splats():
    """Returns a list of all splats in the database"""
    with Session(engine) as session:
        splats = session.exec(select(Splat)).all()

    return splats


@app.post("/splats")
def create_splat(image: UploadFile = File(...)):
    """Accepts an image file, processes it with the Sharp CLI tool, and stores the information about the splat in the database while
    also saving the input image and the output .ply file in the filesystem. Returns the ID of the created splat for reference.
    """
    try:
        if image.content_type not in ["image/jpeg", "image/png"]:
            return HTTPException(
                status_code=400,
                detail="Invalid file type. Only JPEG and PNG are allowed.",
            )
        # Generates a unique ID for the splat using uuid4 to later be used as a unique id for splat information
        splat_id = uuid4()
        os.makedirs(f"./splats/{splat_id}/input", exist_ok=True)
        # Saves the uploaded image to the file system, so that the Sharp CLI tool can access it for processing.
        with open(f"./splats/{splat_id}/input/image.png", "wb") as buffer:
            buffer.write(image.file.read())

        generate_splat(splat_id=str(splat_id))

        # Write's the splat information to the database, including the filename, input path, and output path for later retrieval and reference.
        with Session(engine) as session:
            splat = Splat(
                id=str(splat_id),
                filename=image.filename,
                input_path=f"./splats/{splat_id}/input/image.png",
                output_path=f"./splats/{splat_id}/output",
            )
            session.add(splat)
            session.commit()

        return {"splat_id": str(splat_id)}
    except Exception as e:
        # If something seriously goes wrong through this long process catch the error and throw it to the user
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/splat/{splat_id}")
def read_splat(splat_id: str):
    """Returns details of a specific splat by ID"""
    with Session(engine) as session:
        splat = session.get(Splat, splat_id)
    if not splat:
        raise HTTPException(status_code=404, detail="Splat not found")

    return {
        "splat": splat,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8301)
