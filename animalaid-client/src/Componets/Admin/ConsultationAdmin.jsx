// src/components/Admin/ConsultationsAdmin.jsx
import React, { useState, useEffect } from 'react';

const mockConsultations = [
  {
    id: 1,
    username: 'john_doe',
    symptoms: 'Sneezing, runny nose, weak movement',
    images: [
      'https://via.placeholder.com/100',
      'https://via.placeholder.com/100',
    ],
    diagnosis: 'Likely Flu',
    status: 'Pending',
    reply: '',
  },
  {
    id: 2,
    username: 'mary_smith',
    symptoms: 'Loss of appetite and swollen legs',
    images: ['https://via.placeholder.com/100'],
    diagnosis: 'Foot-and-mouth disease',
    status: 'Diagnosed',
    reply: 'Give clean water and antibiotic injection',
  },
];

const ConsultationAdmin = () => {
  const [consultations, setConsultations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    // Replace this with API call
    setConsultations(mockConsultations);
  }, []);

  const handleReplySubmit = () => {
    if (!selected) return;
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === selected.id ? { ...c, reply: replyText, status: 'Replied' } : c
      )
    );
    setSelected(null);
    setReplyText('');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Consultation Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consultations.map((consult) => (
          <div key={consult.id} className="bg-white p-4 rounded shadow">
            <div className="mb-2 text-sm text-gray-500">User: {consult.username}</div>
            <div className="font-semibold">Symptoms:</div>
            <p className="mb-2">{consult.symptoms}</p>

            <div className="mb-2">
              <div className="font-semibold">Images:</div>
              <div className="flex gap-2 mt-1">
                {consult.images.map((img, idx) => (
                  <img key={idx} src={img} alt="Animal" className="h-20 w-20 object-cover rounded" />
                ))}
              </div>
            </div>

            {consult.diagnosis && (
              <div className="mb-2">
                <div className="font-semibold">Diagnosis:</div>
                <p>{consult.diagnosis}</p>
              </div>
            )}

            <div className="mb-2">
              <span className="text-sm font-medium">Status:</span>{' '}
              <span
                className={`px-2 py-1 rounded text-white ${
                  consult.status === 'Pending'
                    ? 'bg-yellow-500'
                    : consult.status === 'Diagnosed'
                    ? 'bg-blue-500'
                    : 'bg-green-500'
                }`}
              >
                {consult.status}
              </span>
            </div>

            {consult.reply ? (
              <div className="mt-2">
                <div className="font-semibold">Admin Reply:</div>
                <p>{consult.reply}</p>
              </div>
            ) : (
              <button
                onClick={() => setSelected(consult)}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Reply
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">Reply to {selected.username}</h3>
            <p className="mb-2 text-sm text-gray-600">Symptoms: {selected.symptoms}</p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply or suggested treatment..."
              className="w-full border p-2 rounded mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelected(null);
                  setReplyText('');
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationAdmin;
