import LibraryList from "./LibraryList";

function Queue() {
    return (
        <LibraryList
            type="queue"
            title="Queue"
            description="Your saved movies, series, and anime waiting for their turn."
            emptyTitle="Your queue is empty"
            emptyText="Add a movie, series, or anime from its details page and it will appear here."
            icon="+"
        />
    );
}

export default Queue;
