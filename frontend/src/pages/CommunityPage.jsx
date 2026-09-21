import React, { useEffect, useState } from "react";
import Sidebar from "../components/community/Sidebar";
import CommunityHero from "../components/community/CommunityHero";
import InviteCard from "../components/community/InviteCard";
import UserCard from "../components/community/UserCard";

import { apiFetch } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function CommunityPage() {
  const { user: loggedInUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [suggestedLoading, setSuggestedLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /*
    Keep sidebar selections local until the user clicks Apply.
  */
  const [filters, setFilters] = useState({
    skinTypes: [],
    skinConcerns: [],
    ageGroups: [],
    locations: [],
    sort: "",
  });

 
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    setCurrentPage(1);
  };

  
  const handleReset = () => {
    setFilters({
      skinTypes: [],
      skinConcerns: [],
      ageGroups: [],
      locations: [],
      sort: "",
    });

    setCurrentPage(1);
  };

  
  const loadUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      
      if (debouncedSearch.trim()) {
  params.set(
    "search",
    debouncedSearch.trim()
  );
}

      
      if (filters.skinTypes.length > 0) {
        params.set(
          "skinTypes",
          filters.skinTypes.join(",")
        );
      }

     
      if (filters.skinConcerns.length > 0) {
        params.set(
          "skinConcerns",
          filters.skinConcerns.join(",")
        );
      }

      if (filters.ageGroups.length > 0) {
        params.set(
          "ageGroups",
          filters.ageGroups.join(",")
        );
      }

      
      if (filters.locations.length > 0) {
        params.set(
          "locations",
          filters.locations.join(",")
        );
      }

      
      if (filters.sort) {
        params.set("sort", filters.sort);
      }

      
      params.set("page", currentPage);
      params.set("limit", 8);

      const queryString = params.toString();

      const data = await apiFetch(
        `/users?${queryString}`
      );

      /*
        Backend pagination response

      */

      if (Array.isArray(data)) {
        setUsers(data);
        setTotalPages(1);
      } else {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error(
        "Failed to load users:",
        error
      );

      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  
  const loadSuggestedUsers = async () => {
    try {
      setSuggestedLoading(true);

      const data = await apiFetch(
        "/users/suggested"
      );

      setSuggestedUsers(
        Array.isArray(data)
          ? data
          : data.users || []
      );
    } catch (error) {
      console.error(
        "Failed to load suggested users:",
        error
      );

      setSuggestedUsers([]);
    } finally {
      setSuggestedLoading(false);
    }
  };

  // Wait briefly before searching to avoid an API request on every keystroke.
  
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 400);

  return () => {
    clearTimeout(timer);
  };
}, [search]);


useEffect(() => {
  loadUsers();
}, [
  filters,
  debouncedSearch,
  currentPage,
]);

  
 useEffect(() => {
  loadSuggestedUsers();
}, [loggedInUser?._id]);
  

  const showAll = () => {
    setFilters({
      skinTypes: [],
      skinConcerns: [],
      ageGroups: [],
      locations: [],
      sort: "",
    });

    setCurrentPage(1);
  };

  const showTrending = () => {
    setFilters((prev) => ({
      ...prev,
      sort: "most-helpful",
    }));

    setCurrentPage(1);
  };

  const showNewMembers = () => {
    setFilters((prev) => ({
      ...prev,
      sort: "newest",
    }));

    setCurrentPage(1);
  };

  const showNearby = () => {
    setFilters((prev) => ({
      ...prev,
      locations: ["Nearby"],
    }));

    setCurrentPage(1);
  };

  /*
    FOLLOW FROM SUGGESTED PANEL
  */
  const handleSuggestedFollow = async (userId) => {
  if (!loggedInUser) {
    showToast("Log in to follow people");
    return;
  }

  try {
    await apiFetch(
      `/users/${userId}/follow`,
      {
        method: "POST",
      }
    );

    setSuggestedUsers((prev) =>
      prev.filter(
        (user) => user._id !== userId
      )
    );

    showToast("Following user 💗");

    loadUsers();
  } catch (error) {
    console.error(
      "Failed to follow user:",
      error
    );

    showToast(
      error.message ||
        "Failed to follow user"
    );
  }
};

    
     
   

  return (
    <div className="community-page">

      <div className="community-layout">

        
       

        <Sidebar
          filters={filters}
          onFilterChange={
            handleFilterChange
          }
          onReset={handleReset}
        />

       

        <main className="community-main">

         

          <CommunityHero />

          {/* =================================
              SEARCH + TABS
          ================================= */}

          <div className="community-topbar">

            

            <div className="community-search">

              <input
                type="text"
                placeholder="Search users by name, username or interests..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <span>⌕</span>

            </div>

          
            <div className="community-tabs">

              <button
                className={
                  filters.sort === "" &&
                  filters.skinTypes.length === 0 &&
                  filters.skinConcerns.length === 0 &&
                  filters.ageGroups.length === 0 &&
                  filters.locations.length === 0
                    ? "active"
                    : ""
                }
                onClick={showAll}
              >
                All
              </button>

              <button
                className={
                  filters.sort ===
                  "most-helpful"
                    ? "active"
                    : ""
                }
                onClick={showTrending}
              >
                Trending
              </button>

              <button
                className={
                  filters.sort === "newest"
                    ? "active"
                    : ""
                }
                onClick={showNewMembers}
              >
                New Members
              </button>

              <button
                className={
                  filters.locations.includes(
                    "Nearby"
                  )
                    ? "active"
                    : ""
                }
                onClick={showNearby}
              >
                Nearby
              </button>

            </div>

            

            <select
              className="community-sort-select"
              value={filters.sort}
              onChange={(e) =>
                handleFilterChange(
                  "sort",
                  e.target.value
                )
              }
            >
              <option value="">
                Most Helpful
              </option>

              <option value="most-helpful">
                Most Helpful
              </option>

              <option value="most-reviews">
                Most Reviews
              </option>

              <option value="newest">
                Newest Members
              </option>

              <option value="most-followers">
                Most Followers
              </option>
            </select>

          </div>

          {/* =================================
              USERS
          ================================= */}

          {loading ? (
            <div className="loading-text">
              Loading community...
            </div>
          ) : users.length === 0 ? (
            <div className="empty-community">

              <h2>
                No users found
              </h2>

              <p>
                Try changing your filters
                or search.
              </p>

            </div>
          ) : (
            <div className="user-grid">

              {users.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                />
              ))}

            </div>
          )}

         

          {totalPages > 1 && (
            <div className="pagination">

              <button
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
              >
                ‹
              </button>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) =>
                  index + 1
              )
                .slice(0, 15)
                .map((page) => (
                  <button
                    key={page}
                    className={
                      currentPage === page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(page)
                    }
                  >
                    {page}
                  </button>
                ))}

              <button
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
              >
                ›
              </button>

            </div>
          )}

        </main>

        

        <aside className="community-right">


          <div className="suggested-panel">

            <div className="suggested-header">

              <h2>
                Suggested For You
              </h2>

              <button
                type="button"
                onClick={() =>
                  loadSuggestedUsers()
                }
              >
                View All
              </button>

            </div>

            {suggestedLoading ? (
              <p className="suggested-loading">
                Loading...
              </p>
            ) : suggestedUsers.length ===
              0 ? (
              <p className="suggested-empty">
                No suggestions right now.
              </p>
            ) : (
              suggestedUsers
                .slice(0, 5)
                .map((user) => (
                  <div
                    className="suggested-row"
                    key={user._id}
                  >

                    <div className="suggested-avatar">

                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={
                            user.username
                          }
                        />
                      ) : (
                        <div className="suggested-avatar-placeholder">
                          {user.username
                            ?.charAt(
                              0
                            )
                            .toUpperCase()}
                        </div>
                      )}

                    </div>

                    <div className="suggested-info">

                      <strong>
                        @{user.username}
                      </strong>

                      <span>
                        {user.skinType
                          ? `${user.skinType} Skin`
                          : "Beauty Lover"}
                      </span>

                    </div>

                   <button
  type="button"
  disabled={user.isFollowing}
  onClick={() =>
    handleSuggestedFollow(
      user._id
    )
  }
>
  {user.isFollowing
    ? "Following"
    : "Follow"}
</button>

                  </div>
                ))
            )}

          </div>

          

          <InviteCard />

        </aside>

      </div>

    </div>
  );
}
