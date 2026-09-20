import LibraryList from "./LibraryList";

function Watched() {
    return (
        <LibraryList
            type="watched"
            title="Watched"
            description="Everything you've completed, marked with the watch tick."
            emptyTitle="Nothing watched yet"
            emptyText="Use the watched button on a title's details page to mark a title as watched."
            icon="?"
            emptyClass="watched-empty"
        />
    );
}

export default Watched;

