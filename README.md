## Project title: *MedSegment-A Tumour measurement and Medical Imaging Analysis tools*

### Project description: 
*MedSegment is a web-based application that uses deep learning to detect and analyze brain tumours from MRI scans. Users can upload T1-weighted NIfTI files to identify tumour presence, view segmentation overlays, calculate key tumour metrics (like area, volume, and sphericity), explore a 3D tumour model, and download results as a report. Built with React, Flask, and PostgreSQL, the tool offers a seamless interface for both clinical and research use.*

### List of requirements : 

Essential:

- Data pre-processing and identification of the tumour to ensure that the images are cleaned.
- Detecting if given MRI file has presence of tumour or not.
- Segmenting the tumour if detected     
- Computing 2D tumour area from the segmented images
- Calculating 3D volume also from the segmented images 
- Supporting standard MRI files format like NIfTI. 
- Analysis results can be exported in various formats like (HTML and PDF)

Desirable:

- Surface area to volume ratio as it helps understand how compact or spread out the tumour is. 
- Measuring roundness as it provides insights into the tumour's shape to understand the growth . 
- Interactive 3D viewer for tumour (rotate, zoom etc.) to enhance the visual aspect.
- Adjusting visual parameters like contrast, brightness etc., so that image interpretation can be enhanced. 
