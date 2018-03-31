
//em++ -O2 --bind CVBridge.cpp tmplt.cpp -o CVBridge.html --preload-file models/ -I include libopencv_world.a libzlib.a -s ALLOW_MEMORY_GROWTH=1


#include "tmplt.h"
#include <emscripten.h>
#include <emscripten/bind.h>

using namespace std;
using namespace cv;
using namespace emscripten;

struct jsRect {
    int x;
    int y;
    int width;
    int height;
};


struct jsPt {
    float x;
    float y;
};

class CVBridge {

	public:
	
		bool tracker;
		float valid,tolerance;
		int patchsz, padding;
		Tmplt* t;
		int width,height;
		Mat frame, grayframe;
		Mat patch;
		Mat world2patch;
		Mat patch2world;
		vector<Rect> faces;
		std::vector<cv::Point2f> wPts;
		std::vector<cv::Point2f> esPts;
		Mat esPtsVec;

		CVBridge(int width, int height) {

			/********************/
			/* INITIALITZATIONS */
			tracker = false;
			valid = 0.0f;
			tolerance = 0.6f;			
			this->width  = width;
			this->height = height;

			// Define the template
			patchsz = 129;
			padding = 100;
			t = new Tmplt(patchsz, padding);

			// Initialize the image
			patch = Mat(t->width, t->height, CV_8UC1, Scalar(0));
			
			// Initialize Mapping transformations
			world2patch = Mat(2, 3, CV_32FC1);
			patch2world = Mat(2, 3, CV_32FC1);

			esPtsVec = Mat(136, 1, CV_32FC1);

		}

		vector<jsPt> processFrame(int buffer) {

			jsPt r;
			vector<jsPt> vr;

			uchar* bufferptr = reinterpret_cast<uchar*>(buffer);
			this->frame = Mat(this->height,this->width,CV_8UC4,bufferptr);			

			cvtColor( this->frame, this->grayframe, CV_RGB2GRAY );

			if (!tracker) {
	
				// Detect the face using Viola & Jones
				t->detectFaces(this->grayframe, this->faces);
				
				for (int f=0; f < faces.size(); f++) {
					this->esPts = t->meanPts;
					t->ipatch2tmplt(this->grayframe, this->patch, this->world2patch, this->patch2world, this->faces[f]);
					valid = t->estimateLandmarks(patch, esPts, t->omegaD);
				
					if (valid > tolerance) {
						// Transform estimated landmarks from tmplt to world
						transform(esPts, wPts, patch2world);
						tracker = true;
						cout << "msg:initializing face"  << endl;
						break;
					}
				}
				faces.clear();
			}
			else {

				t->ipatch2tmpltPro(grayframe, patch, world2patch, patch2world, wPts);
				transform(wPts, esPts, world2patch);

				for (int j = 0; j < 68; j++) {
					esPtsVec.at<float>(j) = esPts[j].x;
					esPtsVec.at<float>(68 + j) = esPts[j].y;
				}

				// Project and reconstruct to constrain initialization
				esPtsVec = t->muS[0] + t->eigS[0]  * (t->eigS[0].t()*(esPtsVec - t->muS[0]));

				for (int j = 0; j < 68; j++) {
					esPts[j].x = esPtsVec.at<float>(j);
					esPts[j].y = esPtsVec.at<float>(68 + j);
				}

				valid = t->estimateLandmarks(patch, esPts, t->omegaT);

				if (valid > tolerance) {
					// Transform estimated landmarks from tmplt to world
					transform(esPts, wPts, patch2world);
					t->ipatch2tmpltPro(grayframe, patch, world2patch, patch2world, wPts);
					transform(wPts, esPts, world2patch);
				}
				else {
					// Fallback to detection mode
					tracker = false;
				}
			}

			for (int j=0; j < (this->wPts).size(); j++) {
				r.x = wPts[j].x; 
				r.y = wPts[j].y;
				vr.push_back(r);
			}

			//r.x = this->faces[0].x; cout <<  r.x << endl;
			//r.y = this->faces[0].y; cout <<  r.y << endl;
			//r.width =  this->faces[0].width;	
			//r.height = this->faces[0].height;
			
			return vr;
		}

};


EMSCRIPTEN_BINDINGS(cvbridge) {

	value_array<jsRect>("jsRect")
        	.element(&jsRect::x)
        	.element(&jsRect::y)
        	.element(&jsRect::width)
		.element(&jsRect::height)
        ;

	value_array<jsPt>("jsPt")
        	.element(&jsPt::x)
        	.element(&jsPt::y)
        ;

	register_vector<jsPt>("vPts");
  	
	class_<CVBridge>("CVBridge")
		.constructor<int,int>()
		.function("processFrame",&CVBridge::processFrame)
	;

}

