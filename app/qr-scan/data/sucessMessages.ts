export interface SuccessMessage {
    headline: string;
    subtext: string;
  }
  
  export const successMessages: SuccessMessage[] = [
    {
      headline: "Both furry overlords have been appeased.",
      subtext: "Your pets are now officially satisfied."
    },
  
    {
      headline: "Both fluff commanders have acknowledged your offering.",
      subtext: "The treaty of peace and full bellies has been renewed."
    },
  
    {
      headline: "Your noble service has been recorded in the annals of pet history.",
      subtext: "Their majesty's bowls are no longer empty. You may proceed with your day."
    },
  
    {
      headline: "The beasts have been quelled.",
      subtext: "Until the next mealtime uprising."
    },
  
    {
      headline: "Food offering accepted.",
      subtext: "The sacred contract of pet and human remains intact."
    },
  
    {
      headline: "Mission Complete: Operation Dinner Drop.",
      subtext: "Tails are wagging. Whiskers are twitching."
    },
  
    {
      headline: "You've satisfied the snack gods.",
      subtext: "They shall allow your continued existence."
    },
  
    {
      headline: "Their Royal Fluffiness is content.",
      subtext: "For now. But they remember everything."
    },
  
    {
      headline: "Feeding complete. Hunger level: 0%.",
      subtext: "Nap protocol initiated."
    },
  
    {
      headline: "Kibble secured. Crisis averted.",
      subtext: "The living room remains safe."
    },
  
    {
      headline: "Tiny stomachs, massively grateful.",
      subtext: "Well… as grateful as pets pretend to be."
    },
  
    {
      headline: "Treats have been distributed to the local rulers.",
      subtext: "Long may they nap."
    }
  ];
  
  // Error messages for when the API fails
  export const errorMessages: SuccessMessage[] = [
    {
      headline: "The feeding servers have gone on strike!",
      subtext: "Don't worry - your pets won't starve. You can manually mark them as fed in the app."
    },
    
    {
      headline: "Houston, we have a kibble problem.",
      subtext: "The digital food delivery system is temporarily offline. Please notify manually."
    },
    
    {
      headline: "The pet feeding matrix has glitched.",
      subtext: "Your furry overlords will have to wait for manual service. They're not pleased."
    },
    
    {
      headline: "Error 404: Food not found.",
      subtext: "The internet can't find your pets' dinner. Time for the old-fashioned approach!"
    },
    
    {
      headline: "The feeding satellites are misaligned.",
      subtext: "Cosmic interference detected. Please resort to primitive techniques."
    }
  ];

  // Already fed messages for when pets have already been fed this meal
  export const alreadyFedMessages: SuccessMessage[] = [
    {
      headline: "The royal subjects have already dined!",
      subtext: "Your furry overlords are already satisfied for this meal. No double-feeding allowed!"
    },
    
    {
      headline: "Mission already accomplished, soldier.",
      subtext: "The feeding operation was completed earlier. Stand down until the next meal time."
    },
    
    {
      headline: "The snack gods have already been appeased.",
      subtext: "Your pets' bellies are full and their hearts content. Try again later!"
    },
    
    {
      headline: "Error 200: Food already delivered.",
      subtext: "The feeding protocol was executed successfully earlier. No additional kibble required."
    },
    
    {
      headline: "The fluff commanders are on full stomachs.",
      subtext: "Their majesties have already received their tribute for this meal period."
    },
    
    {
      headline: "Duplicate feeding request detected!",
      subtext: "The pets are already in post-meal nap mode. Please wait for the next feeding window."
    }
  ];

  // Helper function to get a random success message
  export const getRandomSuccessMessage = (): SuccessMessage => {
    const randomIndex = Math.floor(Math.random() * successMessages.length);
    return successMessages[randomIndex];
  };

  // Helper function to get a random error message
  export const getRandomErrorMessage = (): SuccessMessage => {
    const randomIndex = Math.floor(Math.random() * errorMessages.length);
    return errorMessages[randomIndex];
  };

  // Helper function to get a random already fed message
  export const getRandomAlreadyFedMessage = (): SuccessMessage => {
    const randomIndex = Math.floor(Math.random() * alreadyFedMessages.length);
    return alreadyFedMessages[randomIndex];
  };