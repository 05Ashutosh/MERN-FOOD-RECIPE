class Log {
  static print(user, msg) {
    console.log(
      `\n\n----------------------------------------------${user._id}--------${user.username}----------------------------------`
    );
    console.log(msg);
    console.log();
  }
}

export { Log };
