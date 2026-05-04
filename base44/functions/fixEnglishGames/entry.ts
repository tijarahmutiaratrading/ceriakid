import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all English games
    const englishGames = await base44.entities.Game.filter({ category: 'english' });
    
    if (!englishGames || englishGames.length === 0) {
      return Response.json({ message: 'No English games found', fixed: 0 });
    }

    const englishTopics = [
      'Animals', 'Colors', 'Numbers', 'Fruits', 'Body Parts',
      'Family Members', 'School Items', 'Weather', 'Vegetables', 'Toys',
      'Clothes', 'Shapes', 'Days of Week', 'Months', 'Greetings',
      'Actions', 'Seasons', 'Transport', 'House Items', 'Food'
    ];

    const englishQuestions = {
      'Animals': [
        { q: 'What animal says "Moo"?', options: ['Dog', 'Cow', 'Cat', 'Bird'], correct: 1 },
        { q: 'Which animal says "Meow"?', options: ['Dog', 'Duck', 'Cat', 'Cow'], correct: 2 },
        { q: 'What animal barks?', options: ['Cat', 'Dog', 'Bird', 'Fish'], correct: 1 },
        { q: 'Which animal can fly?', options: ['Dog', 'Fish', 'Bird', 'Cat'], correct: 2 },
        { q: 'What animal says "Quack"?', options: ['Duck', 'Cow', 'Dog', 'Pig'], correct: 0 },
        { q: 'Which animal has a long neck?', options: ['Zebra', 'Giraffe', 'Lion', 'Tiger'], correct: 1 },
        { q: 'What is the largest land animal?', options: ['Lion', 'Elephant', 'Giraffe', 'Rhino'], correct: 1 },
        { q: 'Which animal lives in the ocean?', options: ['Eagle', 'Fish', 'Monkey', 'Bear'], correct: 1 }
      ],
      'Colors': [
        { q: 'What color is the sky?', options: ['Green', 'Blue', 'Red', 'Yellow'], correct: 1 },
        { q: 'What color are apples?', options: ['Yellow', 'Blue', 'Red', 'Green'], correct: 2 },
        { q: 'Which is a primary color?', options: ['Pink', 'Purple', 'Red', 'Brown'], correct: 2 },
        { q: 'What color is grass?', options: ['Brown', 'Green', 'Red', 'Yellow'], correct: 1 },
        { q: 'Which color is dark?', options: ['Yellow', 'White', 'Black', 'Pink'], correct: 2 },
        { q: 'What color is orange?', options: ['Red', 'Yellow', 'Orange', 'Green'], correct: 2 },
        { q: 'Which color do you get mixing red and blue?', options: ['Pink', 'Purple', 'Orange', 'Brown'], correct: 1 },
        { q: 'What color is snow?', options: ['Gray', 'White', 'Blue', 'Yellow'], correct: 1 }
      ],
      'Numbers': [
        { q: 'How many fingers do you have?', options: ['8', '10', '12', '5'], correct: 1 },
        { q: 'What number comes after 5?', options: ['4', '6', '7', '8'], correct: 1 },
        { q: 'What number comes before 3?', options: ['1', '2', '4', '5'], correct: 1 },
        { q: 'How many sides does a triangle have?', options: ['2', '3', '4', '5'], correct: 1 },
        { q: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correct: 1 },
        { q: 'What number is between 7 and 9?', options: ['6', '8', '10', '5'], correct: 1 },
        { q: 'How many wheels on a car?', options: ['2', '3', '4', '6'], correct: 2 },
        { q: 'What is 5 + 3?', options: ['7', '8', '9', '10'], correct: 1 }
      ],
      'Fruits': [
        { q: 'What fruit is yellow and curved?', options: ['Apple', 'Banana', 'Orange', 'Grape'], correct: 1 },
        { q: 'Which fruit is red and round?', options: ['Banana', 'Apple', 'Orange', 'Lemon'], correct: 1 },
        { q: 'What fruit is orange?', options: ['Apple', 'Banana', 'Orange', 'Grape'], correct: 2 },
        { q: 'Which fruit is purple?', options: ['Grape', 'Apple', 'Banana', 'Lemon'], correct: 0 },
        { q: 'What fruit is small and red?', options: ['Watermelon', 'Strawberry', 'Apple', 'Grape'], correct: 1 },
        { q: 'Which fruit has many seeds?', options: ['Apple', 'Watermelon', 'Banana', 'Orange'], correct: 1 },
        { q: 'What fruit is yellow inside?', options: ['Apple', 'Banana', 'Mango', 'Grape'], correct: 1 },
        { q: 'Which fruit is very sweet?', options: ['Lemon', 'Watermelon', 'Grape', 'All'], correct: 3 }
      ]
    };

    let fixed = 0;

    for (const game of englishGames) {
      const topicIndex = englishTopics.findIndex(t => game.title?.includes(t));
      const topicName = topicIndex >= 0 ? englishTopics[topicIndex] : 'Animals';
      const questions = englishQuestions[topicName] || englishQuestions['Animals'];

      // Shuffle and select 8 questions
      const gameQuestions = questions.sort(() => Math.random() - 0.5).slice(0, 8);

      const updatedGameData = {
        questions: gameQuestions.map(q => ({
          question: q.q,
          options: q.options,
          correctIndex: q.correct,
          type: 'multiple_choice'
        }))
      };

      await base44.entities.Game.update(game.id, {
        gameData: updatedGameData,
        totalQuestions: 8
      });

      fixed++;
    }

    return Response.json({
      message: 'Fixed English games',
      fixed,
      totalGames: englishGames.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});