# Remember Backend

The ./sharp directory comes from the Sharp CLI tool. To reiterate this is not my code, but it is neeeded in order to run the CLI tools to generate the splat files.

./splats.db is the SQLite database file that stores the information about the generated splats, such as their IDs, filenames, and output paths.

./app.py is the main FastAPI application file that defines the API endpoints for creating and downloading splats. It handles the logic for processing uploaded images, generating splat files using the Sharp CLI tool, and managing the database records.

./models directory is the directory where Apple's AI model is downloaded and stored to be used by the Sharp CLI tool for generating the splat files.

./splats directory is where the generated splat files and their associated input images are stored. Each splat has its own subdirectory named after its unique ID, containing the input image and the output .ply file.
