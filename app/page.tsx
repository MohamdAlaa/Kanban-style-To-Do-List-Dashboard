import Header from "@/components/Header/Header";
import KanbanBoard from "@/components/KanbanBoard/KanbanBoard";
import JQueryDynamicList from "@/components/JQueryDynamicList/JQueryDynamicList";

export default function Home() {
  return (
    <main className="container py-4">
      <Header />
      <KanbanBoard />
      
      {/* Bonus Task: jQuery Dynamic List */}
      <div className="mt-5">
        <JQueryDynamicList />
      </div>
    </main>
  );
}
