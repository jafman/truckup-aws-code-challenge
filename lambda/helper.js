class Helper {
  static validateTime(timeStr) {
    // Regular expression to match valid time formats
    const timeRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ([AP]M)$/;
    
    // Check if the time string matches the regex pattern
    if (!timeRegex.test(timeStr)) {
        return false;
    }
    
    return true;
  }

  static timeToMinutes(time) {
    var tokens = time.split(' ');
    var timeTokens = tokens[0].split(':');
    var hours = parseInt(timeTokens[0]);
    var minutes = parseInt(timeTokens[1]);
    var period = tokens[1];
    
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    return hours * 60 + minutes;
  }

  static validateTimeRange(startTime, endTime) {
    var startMinutes = this.timeToMinutes(startTime);
    var endMinutes = this.timeToMinutes(endTime);
    return startMinutes < endMinutes;
  }

  static badRequestError(message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: message })
    };
  }
}

exports.Helper = Helper;