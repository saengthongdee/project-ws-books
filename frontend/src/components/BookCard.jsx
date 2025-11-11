import { Link } from "react-router-dom";

export default function BookCard({ book }) {
    return (
        <Link to={`/book/${book.book_id}`}>
            <article className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group">
                <div className="w-full h-80 bg-gray-50 flex items-center justify-center">
                    {book.cover_image ? (
                        <img
                            src={book.cover_image}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                            loading="lazy"
                        />
                    ) : (
                        <div className="text-gray-400">No cover</div>
                    )}
                </div>

                <div className="p-4">
                    <h3 className="line-clamp-2 font-semibold text-gray-900">{book.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-1">ผู้แต่ง: {book.author}</p>
                    <p className="mt-2 text-xs text-emerald-600">
                        คงเหลือ {book.available ?? 0} เล่ม
                    </p>
                </div>
            </article>
        </Link>
    );
}
