import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle2 } from 'lucide-react';
import type { MaterialSection } from '../../../server/src/schema';

interface MaterialViewProps {
  sections: MaterialSection[];
  onComplete: () => void;
}

export function MaterialView({ sections, onComplete }: MaterialViewProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());

  const currentSection = sections[currentSectionIndex];
  const progressPercentage = sections.length > 0 ? ((currentSectionIndex + 1) / sections.length) * 100 : 0;

  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleMarkComplete = () => {
    setCompletedSections((prev: Set<number>) => new Set(prev.add(currentSection.id)));
    if (currentSectionIndex === sections.length - 1) {
      onComplete();
    } else {
      handleNextSection();
    }
  };

  const goToSection = (index: number) => {
    setCurrentSectionIndex(index);
  };

  if (sections.length === 0) {
    return (
      <Card className="border-2 border-indigo-200">
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Loading learning materials...</p>
            <p className="text-sm mt-2">📚 Getting your Set Theory lessons ready!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border-2 border-indigo-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-indigo-800">
                📖 Learning Progress
              </CardTitle>
              <CardDescription className="text-indigo-600">
                Section {currentSectionIndex + 1} of {sections.length}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-indigo-200 text-indigo-800 text-sm px-3 py-1">
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardHeader>
      </Card>

      {/* Section Navigation */}
      <Card className="border-2 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2 flex-wrap">
            {sections.map((section: MaterialSection, index: number) => (
              <Button
                key={section.id}
                variant={index === currentSectionIndex ? "default" : "outline"}
                size="sm"
                onClick={() => goToSection(index)}
                className={`min-w-0 ${
                  index === currentSectionIndex 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : completedSections.has(section.id)
                    ? 'border-green-300 text-green-700 hover:bg-green-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {completedSections.has(section.id) && (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                )}
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="border-2 border-indigo-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl font-bold text-gray-800 leading-relaxed">
            {currentSection.title}
          </CardTitle>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="text-indigo-600 border-indigo-300">
              {currentSection.topic}
            </Badge>
            {completedSections.has(currentSection.id) && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed ✅
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
              {currentSection.content}
            </div>
          </div>

          {/* Interactive Examples for specific sections */}
          {currentSectionIndex === 1 && (
            <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
              <h4 className="font-bold text-green-800 mb-4">🧮 Try It Yourself:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-white rounded border">
                  <strong>Example 1:</strong><br />
                  A = {'{1, 3, 5, 7}'}<br />
                  B = {'{2, 3, 4, 5}'}<br />
                  <span className="text-green-700 font-semibold">A ∪ B = {'{1, 2, 3, 4, 5, 7}'}</span>
                </div>
                <div className="p-4 bg-white rounded border">
                  <strong>Example 2:</strong><br />
                  C = {'{red, blue, green}'}<br />
                  D = {'{blue, yellow, green}'}<br />
                  <span className="text-green-700 font-semibold">C ∪ D = {'{red, blue, green, yellow}'}</span>
                </div>
              </div>
            </div>
          )}

          {currentSectionIndex === 2 && (
            <div className="mt-8 p-6 bg-orange-50 border-2 border-orange-200 rounded-lg">
              <h4 className="font-bold text-orange-800 mb-4">🎯 Practice Examples:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-white rounded border">
                  <strong>Example 1:</strong><br />
                  A = {'{1, 3, 5, 7}'}<br />
                  B = {'{2, 3, 4, 5}'}<br />
                  <span className="text-orange-700 font-semibold">A ∩ B = {'{3, 5}'}</span>
                </div>
                <div className="p-4 bg-white rounded border">
                  <strong>Example 2:</strong><br />
                  E = {'{cat, dog, bird}'}<br />
                  F = {'{fish, bird, hamster}'}<br />
                  <span className="text-orange-700 font-semibold">E ∩ F = {'{bird}'}</span>
                </div>
              </div>
            </div>
          )}

          {currentSectionIndex === 3 && (
            <div className="mt-8 p-6 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <h4 className="font-bold text-purple-800 mb-4">🎨 Visual Learning:</h4>
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded border">
                  <div className="text-sm mb-2">Imagine two overlapping circles:</div>
                  <div className="text-lg">
                    <span className="text-blue-600">● A</span> 
                    <span className="text-purple-600 mx-2">∩</span>
                    <span className="text-red-600">B ●</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    The overlap = Intersection (∩)<br />
                    Everything = Union (∪)
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <Card className="border-2 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousSection}
              disabled={currentSectionIndex === 0}
              className="border-gray-300"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              ← Previous
            </Button>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleMarkComplete}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                {completedSections.has(currentSection.id) ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    ✅ Completed
                  </>
                ) : (
                  <>
                    📝 Mark as Complete
                  </>
                )}
              </Button>

              {currentSectionIndex < sections.length - 1 && (
                <Button
                  onClick={handleNextSection}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Next Section →
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-500">
              {completedSections.size} / {sections.length} sections completed
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}