import LibraryList from "./LibraryList";

function Favorites() {
    return (
        <LibraryList
            type="favorite"
            title="Favorites"
            description="The movies, series, and anime you've chosen as your favorites."
            emptyTitle="No favorites yet"
            emptyText="Tap the favorite button on a title's details page to build your personal collection."
            icon="♥"
            emptyClass="favorite-empty"
        />
    );
}

export default Favorites;
