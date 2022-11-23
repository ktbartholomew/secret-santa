const { setAssignees } = require("./shuffle");

describe("setAssignees", () => {
  it("no exclusions", () => {
    setAssignees([
      { user_id: 1, assignee: null, exclusions: [] },
      { user_id: 2, assignee: null, exclusions: [] },
      { user_id: 3, assignee: null, exclusions: [] },
      { user_id: 4, assignee: null, exclusions: [] },
    ]);
  });

  it("paired exclusions", () => {
    setAssignees([
      { user_id: 1, assignee: null, exclusions: [2] },
      { user_id: 2, assignee: null, exclusions: [1] },
      { user_id: 3, assignee: null, exclusions: [4] },
      { user_id: 4, assignee: null, exclusions: [3] },
      { user_id: 5, assignee: null, exclusions: [6] },
      { user_id: 6, assignee: null, exclusions: [5] },
    ]);
  });

  it("impossible exclusions", () => {
    expect(() => {
      setAssignees([
        { user_id: 1, assignee: null, exclusions: [2, 3, 4, 5, 6] },
        { user_id: 2, assignee: null, exclusions: [1] },
        { user_id: 3, assignee: null, exclusions: [4] },
        { user_id: 4, assignee: null, exclusions: [3] },
        { user_id: 5, assignee: null, exclusions: [6] },
        { user_id: 6, assignee: null, exclusions: [5] },
      ]);
    }).toThrow();
  });
});
