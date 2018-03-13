//em++ -O2 --bind CVBridge.cpp tmplt.cpp -o CVBridge.html --preload-file haarcascade_frontalface_default.xml -I /home/oriol/TFG/SDMv5Bridge/opencv-3.1.0/jsbuild/install/include libopencv_world.a libzlib.a -s ALLOW_MEMORY_GROWTH=1

//em++ -O2 --bind CVBridge.cpp tmplt.cpp -o CVBridge.html --preload-file models/ -I /home/oriol/TFG/SDMv5Bridge/opencv-3.1.0/jsbuild/install/include libopencv_world.a libzlib.a -s ALLOW_MEMORY_GROWTH=1

//g++ -std=c++11  main.cpp tmplt.cpp -o SDM -I/home/oriol/TFG/SDMv5Bridge/opencv-3.1.0/build/install/include -I/home/oriol/TFG/SDMv5Bridge/vlfeat-0.9.21 -L/home/oriol/TFG/SDMv5Bridge/opencv-3.1.0/build/install/lib -L/home/oriol/TFG/SDMv5Bridge/vlfeat-0.9.21/bin/glnxa64 -lopencv_world.so -lvl.so

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

			cvtColor( this->frame, this->grayframe, CV_BGR2GRAY );

			cout << "version 0.1" << endl;

			if (!tracker) {
	
				// Detect the face using Viola & Jones
				t->detectFaces(this->grayframe, this->faces);

			}

			//Remember to change			
			//for (int f=0; f < this->faces.size(); f++) {

			this->esPts = t->meanPts;
			t->ipatch2tmplt(this->grayframe, this->patch, this->world2patch, this->patch2world, this->faces[0]);
			transform(this->esPts, this->wPts, patch2world);
				
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

