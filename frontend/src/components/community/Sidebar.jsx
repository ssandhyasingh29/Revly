import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useToast } from "../../context/ToastContext";

export default function Sidebar({
  filters,
  onFilterChange,
  onReset,
}) {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const skinTypes = [
    "Oily",
    "Dry",
    "Combination",
    "Sensitive",
    "Normal",
  ];

  const skinConcerns = [
    "Acne",
    "Dark Spots",
    "Redness",
  ];

  const ageGroups = [
    "18–24",
    "25–34",
    "35–44",
    "45+",
  ];

  const locations = [
    "India",
    "Nearby",
  ];

  const sortOptions = [
    ["most-helpful", "Most Helpful"],
    ["most-reviews", "Most Reviews"],
    ["newest", "Newest Members"],
    ["most-followers", "Most Followers"],
  ];

  const links = [
    "♟ Discover People",
    "♡ Following",
    "♧ Followers",
    "☏ My Conversations",
    "☆ Find Friends",
    "▣ Top Reviewers",
    "▤ Community Feed",
  ];

  /*
    TEMPORARY FILTERS

    Checkbox click =
    only pendingFilters changes.

    Actual filters change only
    after Apply button.
  */

  const [
    pendingFilters,
    setPendingFilters,
  ] = useState({
    skinTypes: filters.skinTypes || [],
    skinConcerns:
      filters.skinConcerns || [],
    ageGroups:
      filters.ageGroups || [],
    locations:
      filters.locations || [],
    sort: filters.sort || "",
  });


  const [
    applyChecked,
    setApplyChecked,
  ] = useState(false);

  /*
    When actual filters change,
    synchronize sidebar.
  */

  useEffect(() => {
    setPendingFilters({
      skinTypes:
        filters.skinTypes || [],

      skinConcerns:
        filters.skinConcerns || [],

      ageGroups:
        filters.ageGroups || [],

      locations:
        filters.locations || [],

      sort: filters.sort || "",
    });

    setApplyChecked(false);
  }, [filters]);



  const handleLinkClick = (link) => {
    if (
      link.includes(
        "My Conversations"
      )
    ) {
      navigate("/messages");
      return;
    }

    showToast(
      link.replace(
        /^[^ ]+ /,
        ""
      )
    );
  };


  const toggleCheckbox = (
    key,
    value
  ) => {
    setPendingFilters((prev) => {
      const currentValues =
        prev[key] || [];

      const alreadySelected =
        currentValues.includes(
          value
        );

      return {
        ...prev,

        [key]: alreadySelected
          ? currentValues.filter(
              (item) =>
                item !== value
            )
          : [
              ...currentValues,
              value,
            ],
      };
    });

    /*
      New selection means
      it has not been applied yet.
    */

    setApplyChecked(false);
  };

  

  const handleSortChange = (
    value
  ) => {
    setPendingFilters((prev) => ({
      ...prev,

      sort:
        prev.sort === value
          ? ""
          : value,
    }));

    setApplyChecked(false);
  };

 

  const handleApplyAll = () => {
    onFilterChange(
      "skinTypes",
      pendingFilters.skinTypes
    );

    onFilterChange(
      "skinConcerns",
      pendingFilters.skinConcerns
    );

    onFilterChange(
      "ageGroups",
      pendingFilters.ageGroups
    );

    onFilterChange(
      "locations",
      pendingFilters.locations
    );

    onFilterChange(
      "sort",
      pendingFilters.sort
    );

    setApplyChecked(true);

    showToast(
      "Filters applied"
    );
  };

 
  const handleReset = () => {
    const resetFilters = {
      skinTypes: [],
      skinConcerns: [],
      ageGroups: [],
      locations: [],
      sort: "",
    };

    setPendingFilters(
      resetFilters
    );

    setApplyChecked(false);

    onReset();
  };

  return (
    <aside className="community-sidebar">

      

      <div className="side-links">

        {links.map(
          (link, index) => (
            <button
              key={link}
              className={
                index === 0
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleLinkClick(
                  link
                )
              }
            >
              {link}
            </button>
          )
        )}

      </div>

      
      <div className="filters">

        <div className="filter-title">

          <strong>
            Filters
          </strong>

          <button
            type="button"
            onClick={
              handleReset
            }
          >
            Reset
          </button>

        </div>

        

        <details open>

          <summary>
            Skin Type
          </summary>

          {skinTypes.map(
            (type) => (
              <label key={type}>

                <input
                  type="checkbox"
                  checked={pendingFilters.skinTypes.includes(
                    type
                  )}
                  onChange={() =>
                    toggleCheckbox(
                      "skinTypes",
                      type
                    )
                  }
                />

                {type}

              </label>
            )
          )}

        </details>

        

        <details>

          <summary>
            Skin Concerns
          </summary>

          {skinConcerns.map(
            (concern) => (
              <label
                key={concern}
              >

                <input
                  type="checkbox"
                  checked={pendingFilters.skinConcerns.includes(
                    concern
                  )}
                  onChange={() =>
                    toggleCheckbox(
                      "skinConcerns",
                      concern
                    )
                  }
                />

                {concern}

              </label>
            )
          )}

        </details>

       

        <details>

          <summary>
            Age Group
          </summary>

          {ageGroups.map(
            (age) => (
              <label key={age}>

                <input
                  type="checkbox"
                  checked={pendingFilters.ageGroups.includes(
                    age
                  )}
                  onChange={() =>
                    toggleCheckbox(
                      "ageGroups",
                      age
                    )
                  }
                />

                {age}

              </label>
            )
          )}

        </details>

        

        <details>

          <summary>
            Location
          </summary>

          {locations.map(
            (location) => (
              <label
                key={location}
              >

                <input
                  type="checkbox"
                  checked={pendingFilters.locations.includes(
                    location
                  )}
                  onChange={() =>
                    toggleCheckbox(
                      "locations",
                      location
                    )
                  }
                />

                {location}

              </label>
            )
          )}

        </details>

       

        <fieldset>

          <legend>
            Sort By
          </legend>

          {sortOptions.map(
            ([value, label]) => (
              <label
                key={value}
              >

                <input
                  type="radio"
                  name="community-sort"
                  checked={
                    pendingFilters.sort ===
                    value
                  }
                  onChange={() =>
                    handleSortChange(
                      value
                    )
                  }
                />

                {label}

              </label>
            )
          )}

        </fieldset>

       

        <div className="apply-all-wrapper">

          <label className="apply-all-checkbox">

            <input
              type="checkbox"
              checked={
                applyChecked
              }
              onChange={(e) =>
                setApplyChecked(
                  e.target.checked
                )
              }
            />

            <span>
              Apply All
            </span>

          </label>

          <button
            type="button"
            className="apply-all-btn"
            onClick={() => {
              handleApplyAll();
              setApplyChecked(true);
            }}
          >
            Apply
          </button>

        </div>

      </div>

    </aside>
  );
}
