/**
 * The tests of the essay "Why you should start writing tests as they were
 * documentation" (2018): the two it starts with, which look at `_queue`, and
 * the one it ends with, which reads like the documentation of a dispatcher.
 * Only the setup is added, which the essay leaves out.
 */
export const DISPATCHER_TESTS = `let dispatcher, cb;
beforeEach(() => {
  dispatcher = new Dispatcher();
  cb = fn();
});

describe("addListener", () => {
  it("should add a callback to the queue", () => {
    dispatcher.addListener(cb);
    expect(dispatcher._queue).toContain(cb);
  });
});

describe("deliver", () => {
  it("should invoke queue callbacks with the received argument", () => {
    dispatcher._queue.push(cb);
    dispatcher.deliver("message");
    expect(cb).toHaveBeenCalledWith("message");
  });
});

it("delivers messages to listeners", () => {
  dispatcher.addListener(cb);
  dispatcher.deliver("message");
  expect(cb).toHaveBeenCalledWith("message");
});`;
