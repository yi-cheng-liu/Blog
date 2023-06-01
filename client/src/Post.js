import { formatISO9075 } from 'date-fns';

export default function Post({title, summary, cover, content, createdAt, author,}) {
  return (
    <div className="post">
      <div className="image">
        <img
          src="https://techcrunch.com/wp-content/uploads/2021/12/android-spyware2.jpg?w=730&crop=1"
          alt=""
        />
      </div>
      <div className="texts">
        <h2>{title}</h2>
        <p className="info">
          <a className="author" href=" ">{ author.username }</a>
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
}
