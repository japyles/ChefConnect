import { Search } from "lucide-react";
import { useRecipeStore } from "@/store/recipes";
import { useCallback, useState } from "react";
import debounce from "lodash/debounce";

export function SearchBar() {
  const [value, setValue] = useState("");
  const setSearchQuery = useRecipeStore((state) => state.setSearchQuery);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    [setSearchQuery]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        placeholder="What are you looking for?"
        onChange={handleChange}
        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
      />
    </div>
  );
}
