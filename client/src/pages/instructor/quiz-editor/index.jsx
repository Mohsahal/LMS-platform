import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInstructorCourseQuizService, upsertCourseQuizService, listQuizSubmissionsService } from "@/services";
import { Loader2 } from "lucide-react";

function InstructorQuizEditorPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("Course Quiz");
  const [questions, setQuestions] = useState(
    Array.from({ length: 10 }).map(() => ({ questionText: "", options: ["", "", "", ""], correctIndex: 0 }))
  );
  const [saving, setSaving] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    async function load() {
      if (!courseId) return;
      const res = await getInstructorCourseQuizService(courseId);
      if (res?.success && res?.data) {
        setTitle(res.data.title || "Course Quiz");
        setQuestions(res.data.questions || questions);
      }
      const subs = await listQuizSubmissionsService(courseId);
      if (subs?.success) setSubmissions(subs.data || []);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const updateQuestion = (idx, patch) => {
    setQuestions(prev => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[optIdx] = value;
      return { ...q, options: opts };
    }));
  };

  async function handleSave() {
    try {
      setSaving(true);
      const payload = { title, questions };
      const res = await upsertCourseQuizService(courseId, payload);
      if (!res?.success) throw new Error(res?.message || "Failed to save");
      // brief delay to show spinner then navigate back
      setTimeout(() => navigate(-1), 500);
    } catch (e) {
      alert(e.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course Quiz" />
            </div>
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="border rounded p-4">
                  <div className="mb-2 text-sm font-semibold">Question {idx + 1}</div>
                  <Input
                    className="mb-3"
                    value={q.questionText}
                    onChange={e => updateQuestion(idx, { questionText: e.target.value })}
                    placeholder="Enter question text"
                  />
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${idx}`}
                          checked={q.correctIndex === oIdx}
                          onChange={() => updateQuestion(idx, { correctIndex: oIdx })}
                        />
                        <Input value={opt} onChange={e => updateOption(idx, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
                ) : (
                  "Save Quiz"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(submissions) && submissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Student</th>
                      <th className="p-2">Score</th>
                      <th className="p-2">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s._id} className="border-t">
                        <td className="p-2">{s.studentName || s.studentId}</td>
                        <td className="p-2">{s.score} / 10</td>
                        <td className="p-2">{new Date(s.createdAt || s.submittedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-600">No submissions yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InstructorQuizEditorPage;


