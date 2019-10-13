---
title: nVIDIA CUDA
image_width: 143
image_height: 132
image: /assets/images/cuda.png
url: http://www.nvidia.com/object/cuda_home_new.html
description: >
  NVIDIA CUDA is a language
  to program graphical GPUs like the
  were common processors.
tags:
  - high-performance
  
---
Nowadays GPUs have hundreds of cores, and each core executes
tens of operations simultaneously.
It creates the need to coordinate the simultaneous
manipulation of thousands of data independently.
CUDA language is designed in order to coordinate
all available resources easily.

The key to obtain the maximum performance with CUDA is the
correct management of the memory available in each core,
common memory is too slow.
Used correctly, in the correct app,
it can speed up a program 100 times just spending 80€ in a GPU.
If more power is required, better GPUs can be acquired,
or more GPUs can be used simultaneously.

```c
#include <stdio.h>
 
const int N = 16; 
const int blocksize = 16; 
 
__global__ 
void hello(char *a, int *b) 
{
    a[threadIdx.x] += b[threadIdx.x];
}
 
int main()
{
    char a[N] = "Hello \0\0\0\0\0\0";
    int b[N] = {15, 10, 6, 0, -11, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
 
    char *ad;
    int *bd;
    const int csize = N*sizeof(char);
    const int isize = N*sizeof(int);
 
    printf("%s", a);
 
    cudaMalloc( (void**)&ad, csize ); 
    cudaMalloc( (void**)&bd, isize ); 
    cudaMemcpy( ad, a, csize, cudaMemcpyHostToDevice ); 
    cudaMemcpy( bd, b, isize, cudaMemcpyHostToDevice ); 
    
    dim3 dimBlock( blocksize, 1 );
    dim3 dimGrid( 1, 1 );
    hello<<<dimGrid, dimBlock>>>(ad, bd);
    cudaMemcpy( a, ad, csize, cudaMemcpyDeviceToHost ); 
    cudaFree( ad );
    cudaFree( bd );
    
    printf("%s\n", a);
    return EXIT_SUCCESS;
}
```
