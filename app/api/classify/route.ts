import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import { z } from 'zod';

const AnalysisRequestSchema = z.object({
  image: z.string().min(1, 'Image required'),
  model: z.string().optional(),
  language: z.string().length(2).optional(),
  simple_names: z.boolean().optional(),
  save_image: z.boolean().optional(),
  anon_filter: z.boolean().optional()
});

const AutodermPredictionSchema = z.object({
  confidence: z.number(), // Changed from probability
  possibility: z.string(),
  icd: z.string(),
  name: z.string(), // Changed from class
  classificationId: z.string(),
  readMoreUrl: z.string().url(),
});

const AutodermResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  id: z.string(),
  predictions: z.array(AutodermPredictionSchema),
  fitzpatrick: z.number().optional(),
  anonymous: z.boolean().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const validationResult = AnalysisRequestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      return NextResponse.json({
        code: 'VALIDATION_ERROR',
        error: 'Invalid request format',
        message: validationResult.error.errors[0]?.message,
        details: validationResult.error.errors
      }, { status: 400 });
    }
    
    const body = validationResult.data;
    const { image } = body; // Assuming image is sent as a base64 string or URL

    if (!image) {
      return NextResponse.json({
  code: 'MISSING_IMAGE',
  error: 'No image provided',
  message: 'Please upload an image for analysis',
  details: 'Image payload missing in request body'
}, { status: 400 });
    }

    // Placeholder for AI model integration
    // In a real application, you would send the image to an AI service (e.g., Skinive, a custom model, etc.)
    // For now, we'll return a mock response similar to the old frontend mock data structure
    console.log('Received image for analysis (first 50 chars):', typeof image === 'string' ? image.substring(0, 50) : 'Not a string');

    // Use Autoderm API for analysis
    const AUTODERM_API_KEY = process.env.AUTODERM_API_KEY;
    if (!AUTODERM_API_KEY) {
      console.error('Autoderm API key is not configured.');
      return NextResponse.json({
        code: 'API_KEY_MISSING',
        error: 'API key for analysis service is not configured.',
        message: 'The server is not configured to perform analysis.',
        details: 'AUTODERM_API_KEY environment variable is not set.'
      }, { status: 500 });
    }

    // Extract parameters for Autoderm API from request body
    const {
      model = 'autoderm_v2_2', // Default to latest model as per docs
      language = 'en',       // Default to English
      simple_names,          // boolean
      save_image,            // boolean, defaults to true on Autoderm side
      anon_filter            // boolean
    } = body;

    // Construct Autoderm API URL with query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('model', model);
    queryParams.append('language', language);
    if (simple_names !== undefined) queryParams.append('simple_names', String(simple_names));
    if (save_image !== undefined) queryParams.append('save_image', String(save_image));
    if (anon_filter !== undefined) queryParams.append('anon_filter', String(anon_filter));

    const AUTODERM_API_URL_WITH_QUERY = `https://autoderm.ai/v1/query?${queryParams.toString()}`;

    try {
      const formData = new FormData();
      let imageBuffer: Buffer;

      // Image validation and conversion (assuming 'image' is base64 string)
      const MAX_IMAGE_SIZE_MB = 5; 
      const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

      if (typeof image !== 'string') {
        return NextResponse.json({
          code: 'INVALID_IMAGE_FORMAT',
          error: 'Invalid image format',
          message: 'Image must be provided as a base64 string or data URL.',
          details: 'Received non-string image payload.'
        }, { status: 400 });
      }

      let base64Data = image;
      if (image.startsWith('data:')) {
        const parts = image.split(',');
        if (parts.length !== 2) {
            return NextResponse.json({ code: 'INVALID_DATA_URL', error: 'Invalid Data URL format', message: 'Data URL for image is malformed.' }, { status: 400 });
        }
        const mimeTypePart = parts[0].split(';')[0].replace('data:', '');
        if (!SUPPORTED_MIME_TYPES.includes(mimeTypePart)) {
          return NextResponse.json({
            code: 'UNSUPPORTED_FORMAT',
            error: 'Unsupported image format from Data URL',
            message: `Supported formats: ${SUPPORTED_MIME_TYPES.join(', ')}`,
            details: `Received type: ${mimeTypePart}`
          }, { status: 400 });
        }
        base64Data = parts[1];
      }
      
      imageBuffer = Buffer.from(base64Data, 'base64');

      const bufferSize = imageBuffer.length; 
      const maxSizeBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;

      if (bufferSize > maxSizeBytes) {
        return NextResponse.json({
          code: 'FILE_TOO_LARGE',
          error: 'Image too large',
          message: `Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`,
          details: `Received ${(bufferSize / 1024 / 1024).toFixed(1)}MB.`
        }, { status: 400 });
      }
      // End of image validation and conversion

      formData.append('file', new Blob([imageBuffer]), 'image.jpg'); 

      console.log(`Sending request to Autoderm API: ${AUTODERM_API_URL_WITH_QUERY}`);
      const autodermResponse = await fetch(AUTODERM_API_URL_WITH_QUERY, {
        method: 'POST',
        headers: {
          'Api-Key': AUTODERM_API_KEY,
        },
        body: formData,
      });

      const responseText = await autodermResponse.text(); 
      console.log('Autoderm API raw response status:', autodermResponse.status);
      console.log('Autoderm API raw response text:', responseText);

      if (!autodermResponse.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: responseText || 'Autoderm API request failed with no specific message.' };
        }
        console.error('Autoderm API error data:', errorData);
        const message = errorData.message || errorData.error || 'Autoderm API request failed';
        throw new Error(message);
      }

      const autodermResult = AutodermResponseSchema.parse(JSON.parse(responseText));
      console.debug('Full Autoderm API response JSON:', JSON.stringify(autodermResult, null, 2));

      // Map Autoderm response to frontend format
      const primaryPrediction = autodermResult.predictions?.[0];
      const mappedResponse = {
        condition: primaryPrediction?.class || 'Unknown',
        description: primaryPrediction?.class ? `${primaryPrediction.class} (${(primaryPrediction.probability * 100).toFixed(1)}% confidence)` : 'No prediction available',
        severity: primaryPrediction?.probability > 0.75 ? 'High' : 'Medium',
        recommendations: autodermResult.recommendations || [
          'Consult a dermatologist for clinical examination',
          'Monitor for changes in size or appearance'
        ]
      };

      return NextResponse.json(mappedResponse, { status: 200 });

    } catch (apiError: any) { 
      console.error('Error calling Autoderm API:', apiError);
      let errorMessage = 'Failed to communicate with external analysis service';
      if (apiError instanceof Error) {
        errorMessage = apiError.message;
      } else if (typeof apiError === 'string') {
        errorMessage = apiError;
      }
      
      return NextResponse.json({
        code: 'EXTERNAL_API_ERROR',
        error: 'Analysis service communication failed',
        message: errorMessage,
        details: 'An error occurred while trying to communicate...'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in /api/classify:', error);
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ 
  error: 'Failed to analyze image', 
  message: errorMessage,
  details: 'Internal server error occurred during analysis',
  code: 'INTERNAL_SERVER_ERROR'
}, { status: 500 });
  }
}
