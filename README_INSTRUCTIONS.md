# Form-Filler

Form-Filler is a browser extension that helps in filling forms the right way. This repository contains the source code for the extension and instructions to build it for both Firefox and Chrome.

## Prerequisites

- Operating System: macOS, Windows, or Linux
- [Node.js](https://nodejs.org/en/download/) (v14 or later)
- [npm](https://www.npmjs.com/get-npm) (v6 or later)

## Installation

1. Clone this repository to your local machine:  
   git clone https://github.com/iwaduarte/form-filler.git

2. Navigate to the project directory:  
   cd form-filler
3. Install the required dependencies:  
   npm install

## Building the Extension

1. Build the extension:  
`npm run build`

This will generate the `dist` folder containing the built extension. This build can be used for expanding the extension as you find fit.

## Testing the Extension

1. Run the tests:  
`npm test`


## Running the Extension Locally

1. Serve the extension for Firefox (This will open a new Firefox instance with the extension loaded):  
  `npm run serve:firefox`  

2. Serve the extension for Chrome (This will open a new Chrome instance with the extension loaded):  
`npm run serve:chrome`


This README file will help users understand the requirements, installation process, build process, and deployment process for your Form-Filler extension.