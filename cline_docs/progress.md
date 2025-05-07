# Progress

- Finished setting up CI/CD and continuous deployment pipeline to ensure fast feedback.
## What works
- The website is currently functional and accessible at http://localhost:5173/ when launched locally with "npm run dev".

## What you're working on now
- Next step is to setup ci cd capabilities on supabase & vercel to validate a full continuous deployment pipeline. Ask for credentials when usefull.

## What's left to build
- ✅ Add a dummy test to validate the testing capabilities of the CI CD pipeline
- ✅ Add a first empty stage colum "TODO"
- ✅ Add a first job to the stage
- ✅ Add a terminal column on the right named "DONE". It will modelise a job/card which has been completed 
- ✅ Add a "next day" button which compute an empty function "stagedone()" on each jobs called with knowing its current stage, then moves from "TODO" to "DONE" if output is true
- ✅ Add a second stage modelised by an intermediary column "dev"
- ✅ Add a "work" button on top of the intermediary column.
- ✅ Generating random names for job cards
- ✅ Adding stages modelised by intermediary columns (red active/finished, blue active/finished, green, done)
- ✅ Adding various colors of activities to be done to complete jobs (red, blue, green)
- ✅ Add three types of workers (red, blue, green) that can be assigned to cards
- ✅ Display completion day for cards in the done column and prevent age updates for those cards
- ✅ Make the 6 column isible without the need to have a slidebar. 
- ✅ Reorganize column headers with activity types in the first row and status in the second row
- ✅ Make the workers attribution using a drag & drop mouse feature. 
- ✅ Implement workers output rules : A worker can work only any active column. It work output is computed when "next day" button is clicked. The output for a worker is computed using these rules : 1st rule "a worker working on a column colored like his own color shall output 1 to 6 boxes of his own color. Meaning : The worker is specialized on its color task. His output is randomly choosen between 1 to 6 like a dice.". 2nd rule : "a worker working on a column of a different color has an output of 0 to 3 boxes of the column color, randomly choosen. Meaning: The worker helps on another task he is not a specialist in, so his output is lower". 
- ✅ Workers should be able to work on the same card up to 3 workers
- ✅ The cards in the blue activities should always be red-complete. Red-complete meaning that all its red works has been completed. Same thing for green column : all red & blue shall be completed; At last : Done cards whould have all work completed.
- Remove on red worker and one green
- create another view / tab where we can see a cumulative flow diagram of the activity up-to-date each day please
- create another tab for a work in progress / card aging per column diagram of the activity up-to-date each day please
- create another tab including other meaningfull flow metrics to study flow

## Progress status
- Added completion day display for cards in the done column
- Prevented age updates for cards in the done column
- Made text bold for cards in the done column
- Made all 6 columns visible without a scrollbar
- Reorganized column headers with activity types in the first row and status in the second row
- Implemented drag & drop functionality for worker attribution
- Added visual feedback during drag & drop operations
- Implemented worker output rules for the "next day" button:
  - Workers specialized in a column's color produce 1-6 work items
  - Workers not specialized in a column's color produce 0-3 work items
- Implemented support for up to 3 workers per card
- Added display of multiple workers on cards
- Implemented completion requirements for cards in different columns:
  - Cards in blue activities must have all red work completed
  - Cards in green column must have all red and blue work completed
  - Done cards must have all work completed
- Set initial day to day 7 instead of day 1
- Ensured initial cards have their work completed according to their column requirements for coherence
