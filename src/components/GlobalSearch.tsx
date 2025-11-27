import { useState, useEffect, useCallback } from "react";
import { Search, Calendar, User, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { patientService } from "@/services/patientService";
import { appointmentService } from "@/services/appointmentService";

interface SearchResult {
  id: string;
  type: "appointment" | "patient" | "consultation";
  title: string;
  subtitle: string;
  metadata?: string;
}

export const GlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const searchData = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      const [patients, appointments] = await Promise.all([
        patientService.searchPatients(query).catch(() => []),
        appointmentService.searchAppointments(query).catch(() => []),
      ]);

      if (patients && patients.length > 0) {
        patients.slice(0, 5).forEach((patient) => {
          searchResults.push({
            id: patient.id,
            type: "patient",
            title: patient.fullName,
            subtitle: `UHID: ${patient.uhid} | ${patient.phoneNumber || "No phone"}`,
            metadata: `Age: ${patient.age}, ${patient.gender}`,
          });
        });
      }

      if (appointments && appointments.length > 0) {
        appointments.slice(0, 5).forEach((apt) => {
          searchResults.push({
            id: apt.id,
            type: "appointment",
            title: `Token ${apt.tokenNumber} - ${apt.patientName}`,
            subtitle: `${apt.consultantName || "N/A"} | ${apt.appointmentType || "General"}`,
            metadata: new Date(apt.appointmentDate).toLocaleDateString(),
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchData(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchData]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setSearchQuery("");

    if (result.type === "patient") {
      navigate(`/patient-history/${result.id}`);
    } else if (result.type === "appointment") {
      navigate(`/appointments/${result.id}`);
    }
  };

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4 text-primary" />;
      case "patient":
        return <User className="h-4 w-4 text-primary" />;
      case "consultation":
        return <FileText className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="relative w-96">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients, appointments..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="pl-9 pr-4"
        />
      </div>

      {isOpen && (searchQuery.trim() || isLoading) && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground text-center">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 hover:bg-accent flex items-start gap-3 text-left transition-colors"
                >
                  <div className="mt-0.5">{getResultIcon(result.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{result.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                    {result.metadata && (
                      <div className="text-xs text-muted-foreground mt-1">{result.metadata}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase px-2 py-0.5 bg-muted rounded">
                    {result.type}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground text-center">
              {searchQuery.length < 2 ? "Type at least 2 characters to search" : "No results found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
