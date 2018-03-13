//
//  tmplt.h
//  SDM
//
//  Created by Oriol Martinez Pujol on 26/4/16.
//  Copyright © 2016 Oriol Martinez Pujol. All rights reserved.
//  Copyright © 2016 Universitat Pompeu Fabra, CMTech research group. All rights reserved.
//

#ifndef tmplt_hpp
#define tmplt_hpp

#include <opencv2/opencv.hpp>
#include <opencv2/objdetect.hpp>

//#include <vl/generic.h>
//#include <vl/sift.h>
//#include <vl/mathop.h>

#include <iostream>
#include <fstream>
//#include <time.h>

//#include "ParallelSIFT.h"

using namespace std;
using namespace cv;

#define 	VL_PI   3.141592653589793

class Tmplt {

public:

	/*************/
	/* VARIABLES */

	vector<cv::Mat> muS, eigS, muP, omegaD, omegaT,omegaF, omegaVA, mod, ang;
	vector<cv::Point2f> meanPts;
	Rect pBox, fBox;
	int width, height;
	vector<int> idxPts; 

	/***********/
	/* METHODS */

	// Constructor
	Tmplt(int patchsz, int descsz);
	// Patch Update
	void ipatch2tmplt(cv::Mat frame, cv::Mat& patch, cv::Mat& tform, cv::Mat& itform, cv::Rect origin);
	void ipatch2tmpltPro(cv::Mat frame, cv::Mat& patch, cv::Mat& tform, cv::Mat& itform, vector<cv::Point2f> wPts);
	// Haar face detection
	void detectFaces(cv::Mat grayframe, vector<Rect>& faces);
	// SDM regressors (landmarks)
	//float estimateLandmarks(std::vector<cv::Point2f>& esPts, vector<cv::Mat> omega);
	//void estimateEmotions(std::vector<cv::Point2f>& esPts, cv::Mat& outputVA, cv::Mat& outputEMO);
	// Get bounding box from 2D landmarks
	CvRect landmarks2rect(std::vector<cv::Point2f> esPts);
	Mat procrustes(std::vector<cv::Point2f> esPts);

	// Destructor
	~Tmplt();


private:

	/*************/
	/* VARIABLES */

	// Structure variables
	CascadeClassifier fd;

	// Mapping variables
	vector<Point2f> srcTri;
	vector<Point2f> dstTri;

	// VLFeat Sift variables
	// VlSiftFilt *filt;
	Mat descr, incPts, valPts;
	Mat grad_x, grad_y;
	Mat magnitude, angle;

	float  *grad;
	std::vector<double> scale;
	double threshold;

	/***********/
	/* METHODS */

	// Update patch data (magnitude,gradient)
	void updatePatch(cv::Mat patch);

	// Read from binary files
	bool bin2mat(std::ifstream& ifs, std::vector<cv::Mat>& in_mat);

	// VLFeat auxiliar function
	//void transpose_descriptor(vl_sift_pix* dst, vl_sift_pix* src);

};


#endif /* tmplt_hpp */
