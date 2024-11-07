import React, { useState, ChangeEvent } from "react";
import { AlertCircle, Camera, Smile, User } from "lucide-react";

interface CelebrityFace {
    Face: {
        Confidence: number;
        Emotions?: Array<{
            Type: string;
            Confidence: number;
        }>;
    };
    Id: string;
    KnownGender: {
        Type: string;
    };
    MatchConfidence: number;
    Name: string;
    Urls: string[];
}

interface UnrecognizedFaces{
    Emotions?: Array<{
        Type: string;
        Confidence: number;
    }>;
}

interface ApiResponse {
    CelebrityFaces: CelebrityFace[];
    UnrecognizedFaces: UnrecognizedFaces[];
    errorType? : String;
}

const CelebrityRecognition: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [results, setResults] = useState<ApiResponse[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResults(null);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!selectedImage) {
            setError("Please select an image first");
            return;
        }
    
        setLoading(true);
        setError(null);
    
        const formData = new FormData();
        formData.append("image", selectedImage);
    
        try {
            const response = await fetch("http://localhost:3000/celebrityRecognition", {
                method: "POST",
                body: formData,
            });
            const data: ApiResponse[] = await response.json();

            if (data.some(item => item.errorType)) {
                const errorItem = data.find(item => item.errorType) as { errorMessage?: string };
                setError(errorItem?.errorMessage || "An error occurred during celebrity recognition");
                setResults(null);
                return;
            }            
            setResults(data);
        } catch (err) {
            setError("Request has invalid image format");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 90) return "text-green-600";
        if (confidence >= 70) return "text-blue-600";
        return "text-yellow-600";
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Camera className="h-6 w-6" />
                        <h2 className="text-2xl font-bold">Celebrity Recognition</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center">
                            <label className="cursor-pointer w-full">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-2 text-gray-600">
                                        Click to upload or drag and drop
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </label>
                        </div>

                        {previewUrl && (
                            <div className="mt-4">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-h-96 mx-auto rounded-lg shadow-md"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={!selectedImage || loading}
                            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
                                ${!selectedImage || loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {loading ? "Processing..." : "Recognize Celebrity"}
                        </button>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {results && results?.map((result, resultIndex) => (
                <div key={resultIndex} className="space-y-4">
                    {result?.CelebrityFaces?.map((celebrity, index) => (
                        <div key={`${resultIndex}-${index}`} className="bg-white rounded-lg shadow-md">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Celebrity Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-4">
                                            <User className="h-6 w-6 text-blue-600" />
                                            <h3 className="text-xl font-bold">{celebrity.Name}</h3>
                                        </div>
                                        
                                        <div className="grid gap-4">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-semibold mb-3 text-gray-700">Recognition Details</h4>
                                                <div className="space-y-2 text-gray-600">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">Match Confidence</span>
                                                        <span className={getConfidenceColor(celebrity.MatchConfidence)}>
                                                            {celebrity.MatchConfidence.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">Gender</span>
                                                        <span>{celebrity.KnownGender?.Type}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">Face Detection Confidence</span>
                                                        <span className={getConfidenceColor(celebrity.Face.Confidence)}>
                                                            {celebrity.Face.Confidence.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Emotions Section */}
                                            {celebrity.Face.Emotions && celebrity.Face.Emotions.length > 0 && (
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Smile className="h-5 w-5 text-blue-600" />
                                                        <h4 className="font-semibold text-gray-700">Emotional Analysis</h4>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {celebrity.Face.Emotions.map((emotion, idx) => {
                                                            if( idx > 2) return null;
                                                            else return( 
                                                                <div key={idx} className="flex justify-between items-center">
                                                                <span className="font-medium text-gray-600">
                                                                    {emotion.Type}
                                                                </span>
                                                                <span className={getConfidenceColor(emotion.Confidence)}>
                                                                    {emotion.Confidence.toFixed(1)}%
                                                                </span>
                                                            </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Links Section */}
                                    {celebrity.Urls?.length > 0 && (
                                        <div className="md:w-1/3">
                                            <div className="bg-gray-50 p-4 rounded-lg h-full">
                                                <h4 className="font-semibold mb-3 text-gray-700">Learn More</h4>
                                                <ul className="space-y-2">
                                                    {celebrity.Urls?.map((url, idx) => {
                                                        const validUrl = url.startsWith("http")
                                                            ? url
                                                            : `https://${url}`;

                                                        return (
                                                            <li key={idx}>
                                                                <a
                                                                    href={validUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline block truncate"
                                                                >
                                                                    {url}
                                                                </a>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            {results && results?.map((result, resultIndex) => (
                <div key={resultIndex} className="space-y-4">
                    {result?.UnrecognizedFaces?.map((celebrity, index) => (
                        <div key={`${resultIndex}-${index}`} className="bg-white rounded-lg shadow-md">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {celebrity.Emotions && celebrity.Emotions.length > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Smile className="h-5 w-5 text-blue-600" />
                                                <h4 className="font-semibold text-gray-700">Emotional Analysis</h4>
                                            </div>
                                            <div className="space-y-2">
                                                {celebrity.Emotions.map((emotion, idx) => {
                                                    return( 
                                                        <div key={idx} className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-600">
                                                            {emotion.Type}
                                                        </span>
                                                        <span className={getConfidenceColor(emotion.Confidence)}>
                                                            {emotion.Confidence.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            {results && results?.map((result, index) => 
                result?.CelebrityFaces?.length === 0 && (
                    <div 
                        key={index} 
                        className="flex items-center justify-center p-4 m-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
                    >
                        <p className="text-gray-600 text-lg font-medium">
                            No celebrities recognized in the image.
                        </p>
                    </div>
                )
            )}
        </div>
    );
};

export default CelebrityRecognition;