"use client";

import { useState } from "react";

// Single-open accordion for the FAQ section. The first item starts open.
export default function FaqList({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="faq-list">
      {items.map((item, i) => (
        <div className={`faq-item ${open === i ? "open" : ""}`} key={item.q}>
          <button
            type="button"
            className="faq-q"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? -1 : i)}
          >
            {item.q}
            <span className="faq-icon" aria-hidden="true"></span>
          </button>
          <div className="faq-a">
            <div className="faq-a-inner">
              <p>{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
