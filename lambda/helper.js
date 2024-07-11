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

  static validateDay(dayStr) {
    return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(dayStr.toLowerCase());
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

  static checkForOverLap(newSchedule, existingSchedule) {
    const newStartMinutes = this.timeToMinutes(newSchedule.start_time);
    const newEndMinutes = this.timeToMinutes(newSchedule.end_time);

    const scheduledStartMinutes = this.timeToMinutes(existingSchedule.start_time);
    const scheduledEndMinutes = this.timeToMinutes(existingSchedule.end_time);

    // return (newStartMinutes > scheduledStartMinutes && newStartMinutes < scheduledEndMinutes) || 
    //   (newEndMinutes > scheduledStartMinutes && newEndMinutes < scheduledEndMinutes);
    return (newStartMinutes < scheduledEndMinutes && newEndMinutes > scheduledStartMinutes);
  }

  static validateTimeFormatAndRange(body) {
    if (!this.validateTime(body.start_time)) {
      return {
        isValid: false,
        message: 'Invalid time format for start time, example of time stamp: 12:01 PM, 01:00 AM etc'
      }
    }
  
    if (!this.validateTime(body.end_time)) {
      return {
        isValid: false,
        message: 'Invalid time format for end time, example of time stamp: 12:01 PM, 01:00 AM etc'
      }
    }
    
    if(!this.validateTimeRange(body.start_time, body.end_time)) {
      return {
        isValid: false,
        message: 'Invalid date range, start_time should be less than end_time'
      }
    }
    return {
      isValid: true,
      message: ''
    }
  }
}

exports.Helper = Helper;