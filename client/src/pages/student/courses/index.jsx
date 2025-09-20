import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { filterOptions, sortOptions, courseCategories } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { ArrowUpDownIcon, BookOpen } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");

      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  return queryParams.join("&");

}

function StudentViewCoursesPage() {
  const [sort, setSort] = useState("price-lowtohigh");
  const [filters, setFilters] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = useMemo(() => (searchParams.get("search") || "").trim(), [searchParams]);
  const {
    studentViewCoursesList,
    setStudentViewCoursesList,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  // Results list: paginate client-side with Load More (5 rows at a time)
  const INITIAL_RESULTS = 6;
  const RESULTS_CHUNK = 6;
  const [visibleResults, setVisibleResults] = useState(INITIAL_RESULTS);
  const canLoadMoreResults = (studentViewCoursesList?.length || 0) > visibleResults;
  useEffect(() => {
    // reset visible results when new data arrives
    setVisibleResults(INITIAL_RESULTS);
  }, [studentViewCoursesList]);

  function handleFilterOnChange(getSectionId, getCurrentOption) {
    let cpyFilters = { ...filters };
    const indexOfCurrentSeection =
      Object.keys(cpyFilters).indexOf(getSectionId);

    console.log(indexOfCurrentSeection, getSectionId);
    if (indexOfCurrentSeection === -1) {
      cpyFilters = {
        ...cpyFilters,
        [getSectionId]: [getCurrentOption.id],
      };

      console.log(cpyFilters);
    } else {
      const indexOfCurrentOption = cpyFilters[getSectionId].indexOf(
        getCurrentOption.id
      );

      if (indexOfCurrentOption === -1)
        cpyFilters[getSectionId].push(getCurrentOption.id);
      else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }

    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  const fetchAllStudentViewCourses = useCallback(async (filtersArg, sortArg, searchArg) => {
    const query = new URLSearchParams({
      ...filtersArg,
      sortBy: sortArg,
      ...(searchArg ? { search: searchArg } : {}),
    });
    const response = await fetchStudentViewCourseListService(query.toString());
    if (response?.success) {
      setStudentViewCoursesList(response?.data);
      setLoadingState(false);
    }
  }, [setStudentViewCoursesList, setLoadingState]);

  async function handleCourseNavigate(getCurrentCourseId) {
    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }

  
  
  useEffect(() => {
    const buildQueryStringForFilters = createSearchParamsHelper(filters);
    const next = new URLSearchParams(buildQueryStringForFilters);
    if (searchTerm) next.set("search", searchTerm);
    setSearchParams(next);
  }, [filters, setSearchParams, searchTerm]);

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, []);

  
  

  useEffect(() => {
    if (filters !== null && sort !== null)
      fetchAllStudentViewCourses(filters, sort, searchTerm);
  }, [filters, sort, searchTerm, fetchAllStudentViewCourses]);

   
  // Reset visible results when search changes
  useEffect(() => {
    setVisibleResults(INITIAL_RESULTS);
  }, [searchTerm]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("filters");
    };
  }, []);

  console.log(loadingState, "loadingState");


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-700">
        <div className="container mx-auto px-6 py-10">
          <div className="flex items-center gap-4 text-white">
            <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">Explore Courses</h1>
              <p className="text-gray-200 mt-1">Find your next skill with powerful filters and sorting</p>
            </div>
          </div>
        </div>
      </div>


      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <aside className="w-full lg:w-80 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => { setFilters({}); sessionStorage.removeItem("filters"); }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-6">
                {Object.keys(filterOptions).map((ketItem) => (
                  <div key={ketItem} className="border-t first:border-t-0 border-gray-100 pt-6 first:pt-0">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">{ketItem}</h3>
                    <div className="space-y-2">
                      {filterOptions[ketItem].map((option) => (
                        <Label key={`${ketItem}-${option.id}`} className="flex font-medium items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                          <Checkbox
                            checked={
                              filters &&
                              Object.keys(filters).length > 0 &&
                              filters[ketItem] &&
                              filters[ketItem].indexOf(option.id) > -1
                            }
                            onCheckedChange={() => handleFilterOnChange(ketItem, option)}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <span className="text-gray-700">{option.label}</span>
                        </Label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Course Results</h2>
                  <p className="text-xs text-gray-600">{studentViewCoursesList.length} total matches</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Quick Category Filter */}
                <div className="hidden sm:block">
                  <select
                    value={(filters.category && filters.category[0]) || ""}
                    onChange={(event) => {
                      const val = event.target.value;
                      if (!val) {
                        const { category, ...rest } = filters;
                        setFilters(rest);
                        sessionStorage.setItem("filters", JSON.stringify(rest));
                      } else {
                        const next = { ...filters, category: [val] };
                        setFilters(next);
                        sessionStorage.setItem("filters", JSON.stringify(next));
                      }
                    }}
                    className="border-gray-300 rounded-md text-sm px-3 py-2 bg-white hover:border-gray-400"
                  >
                    <option value="">All Categories</option>
                    {courseCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 px-4 py-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    >
                      <ArrowUpDownIcon className="h-4 w-4" />
                      <span className="font-medium">Sort By</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px] bg-white border-0 shadow-xl rounded-lg">
                    <DropdownMenuRadioGroup value={sort} onValueChange={(value) => setSort(value)}>
                      {sortOptions.map((sortItem) => (
                        <DropdownMenuRadioItem value={sortItem.id} key={sortItem.id} className="hover:bg-gray-50 cursor-pointer">
                          {sortItem.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Cards Grid */}
            {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {studentViewCoursesList.slice(0, visibleResults).map((courseItem) => (
                    <div
                      key={courseItem?._id}
                      onClick={() => handleCourseNavigate(courseItem?._id)}
                      className="group bg-white rounded overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img src={courseItem?.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-md text-xs font-semibold text-gray-700 border border-gray-200">{courseItem?.level?.toUpperCase() || "LEVEL"}</div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-gray-700 transition-colors">{courseItem?.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          {/* <div className="w-6 h-6 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">{courseItem?.instructorName?.charAt(0)}</span>
                          </div>
                          <span className="font-medium truncate">{courseItem?.instructorName}</span> */}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <BookOpen className="w-4 h-4 text-gray-600" />
                            <span>{courseItem?.curriculum?.length || 0} {courseItem?.curriculum?.length <= 1 ? "Lecture" : "Lectures"}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-extrabold text-gray-900">₹{Number(courseItem?.pricing || 0).toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {canLoadMoreResults ? (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => setVisibleResults((n) => n + RESULTS_CHUNK)}
                      variant="outline"
                      className="border-gray-400 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-3"
                    >
                      Load more results
                    </Button>
                  </div>
                ) : null}
              </>
            ) : loadingState ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-4">
                    <Skeleton className="w-full h-40 rounded-lg" />
                    <div className="mt-4 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Courses Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">Try adjusting your filters or check back later for new courses.</p>
                <Button
                  onClick={() => { setFilters({}); sessionStorage.removeItem("filters"); }}
                  className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-semibold px-8 py-3"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default StudentViewCoursesPage;
