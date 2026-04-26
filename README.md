# Immersive Rememember

This repo showcases the power of Apple's ML-Splat, allowing for user's to experience their old pictures in a far more immersive manner.

### Remember Frontend
- ./src/pages are the different astrojs web pages in the application 
- ./src/components/Pages*.tsx are the files that most of the UI and logic is constructed such as fetching data and the splats
- ./src/components/ui/* is the shadcn componenet library to make web development a lot easier and more unified looking comopnents
- /src/hooks/* contains react hooks to handle compelx logic such as face tracking
- The rest of the files are mostly boilerplate code to get the app working

### Remember Backend
- The ./sharp directory comes from the Sharp CLI tool. To reiterate this is not my code, but it is neeeded in order to run the CLI tools to generate the splat files.
- ./splats.db is the SQLite database file that stores the information about the generated splats, such as their IDs, filenames, and output paths.
- ./app.py is the main FastAPI application file that defines the API endpoints for creating and downloading splats. It handles the logic for processing uploaded images, generating splat files using the Sharp CLI tool, and managing the database records.
- ./models directory is the directory where Apple's AI model is downloaded and stored to be used by the Sharp CLI tool for generating the splat files.
- ./splats directory is where the generated splat files and their associated input images are stored. Each splat has its own subdirectory named after its unique ID, containing the input image and the output .ply file.


## Instructions

#### Prep
```bash

git clone https://github.com/apple/ml-sharp sharp
cd sharp
conda create -n remember-sharp python=3.13 # creates the python virtual environment and pins the version to python 3.13
conda activate remember-sharp # activates virtual environment
pip install -r requirements.txt

# now sharp command is accessible to any terminal in the remember-sharp venv
```

#### Backend
```bash
# In the backend folder run
conda activate remember-sharp # activates the virtual environment in the terminal from the same conda environment needed to set up ml-sharp repo
pip install -r requirements.txt # installs the python dependencies
uvicorn run app:app --reload # runs the backend python REST api in dev mode
```

#### Frontend
```bash
# In the frontend folder run
bun i # installs all of the node depenendencies
bun dev # spins up the web server on localhost:3301 using dev mode
```
#### Backend
```bash
# In the backend folder run
conda create remember-sharp # creates the python virtual environment
conda activate remember-sharp # activates the virtual environment in the terminal
pip install -r requirements.txt # installs the python dependencies
uvicorn run app:app --reload # runs the backend python REST api in dev mode
```


## Disclaimers
 This repo has most of the code needed to run except:
 - https://github.com/apple/ml-sharp the repo that has the instructions for setting up the local AI model 
