"use client"; // Ensure this is a client component for dark mode toggle (if needed)
import { TagCloud, type Tag } from "react-tagcloud";

const data = [
    {
        "value": "like",
        "count": 6527
    },
    {
        "value": "good",
        "count": 5467
    },
    {
        "value": "think",
        "count": 3844
    },
    {
        "value": "ive",
        "count": 3049
    },
    {
        "value": "ha",
        "count": 3033
    },
    {
        "value": "yeah",
        "count": 2497
    },
    {
        "value": "go",
        "count": 2436
    },
    {
        "value": "gaz",
        "count": 2345
    },
    {
        "value": "time",
        "count": 2335
    },
    {
        "value": "know",
        "count": 2268
    },
    {
        "value": "work",
        "count": 2119
    },
    {
        "value": "an",
        "count": 2116
    },
    {
        "value": "nice",
        "count": 2109
    },
    {
        "value": "today",
        "count": 1900
    },
    {
        "value": "day",
        "count": 1843
    },
    {
        "value": "last",
        "count": 1827
    },
    {
        "value": "sounds",
        "count": 1768
    },
    {
        "value": "mike",
        "count": 1754
    },
    {
        "value": "sure",
        "count": 1734
    },
    {
        "value": "probably",
        "count": 1731
    },
    {
        "value": "night",
        "count": 1721
    },
    {
        "value": "need",
        "count": 1675
    },
    {
        "value": "still",
        "count": 1649
    },
    {
        "value": "want",
        "count": 1537
    },
    {
        "value": "yea",
        "count": 1528
    },
    {
        "value": "new",
        "count": 1463
    },
    {
        "value": "great",
        "count": 1414
    },
    {
        "value": "people",
        "count": 1403
    },
    {
        "value": "looks",
        "count": 1376
    },
    {
        "value": "didnt",
        "count": 1339
    },
    {
        "value": "ok",
        "count": 1335
    },
    {
        "value": "stuff",
        "count": 1330
    },
    {
        "value": "something",
        "count": 1243
    },
    {
        "value": "never",
        "count": 1239
    },
    {
        "value": "doing",
        "count": 1226
    },
    {
        "value": "bad",
        "count": 1221
    },
    {
        "value": "yeh",
        "count": 1210
    },
    {
        "value": "thought",
        "count": 1148
    },
    {
        "value": "shit",
        "count": 1141
    },
    {
        "value": "better",
        "count": 1135
    },
    {
        "value": "done",
        "count": 1103
    },
    {
        "value": "week",
        "count": 1103
    },
    {
        "value": "watch",
        "count": 1101
    },
    {
        "value": "watching",
        "count": 1085
    },
    {
        "value": "first",
        "count": 1071
    },
    {
        "value": "look",
        "count": 1051
    },
    {
        "value": "thing",
        "count": 1049
    },
    {
        "value": "big",
        "count": 1037
    },
    {
        "value": "way",
        "count": 1025
    },
    {
        "value": "make",
        "count": 1016
    },
    {
        "value": "right",
        "count": 1011
    },
    {
        "value": "pretty",
        "count": 1002
    },
    {
        "value": "actually",
        "count": 995
    },
    {
        "value": "beer",
        "count": 973
    },
    {
        "value": "maybe",
        "count": 972
    },
    {
        "value": "again",
        "count": 971
    },
    {
        "value": "home",
        "count": 960
    },
    {
        "value": "other",
        "count": 949
    },
    {
        "value": "say",
        "count": 944
    },
    {
        "value": "remember",
        "count": 938
    },
    {
        "value": "old",
        "count": 921
    },
    {
        "value": "anything",
        "count": 916
    },
    {
        "value": "anyone",
        "count": 908
    },
    {
        "value": "days",
        "count": 904
    },
    {
        "value": "rooney",
        "count": 893
    },
    {
        "value": "feel",
        "count": 888
    },
    {
        "value": "years",
        "count": 863
    },
    {
        "value": "watched",
        "count": 841
    },
    {
        "value": "these",
        "count": 832
    },
    {
        "value": "tonight",
        "count": 826
    },
    {
        "value": "use",
        "count": 801
    },
    {
        "value": "having",
        "count": 801
    },
    {
        "value": "always",
        "count": 798
    },
    {
        "value": "tomorrow",
        "count": 793
    },
    {
        "value": "harsh",
        "count": 772
    },
    {
        "value": "seen",
        "count": 772
    },
    {
        "value": "said",
        "count": 771
    },
    {
        "value": "being",
        "count": 739
    },
    {
        "value": "love",
        "count": 733
    },
    {
        "value": "used",
        "count": 720
    },
    {
        "value": "looking",
        "count": 717
    },
    {
        "value": "made",
        "count": 717
    },
    {
        "value": "went",
        "count": 715
    },
    {
        "value": "curry",
        "count": 713
    },
    {
        "value": "man",
        "count": 707
    },
    {
        "value": "house",
        "count": 704
    },
    {
        "value": "things",
        "count": 700
    },
    {
        "value": "best",
        "count": 698
    },
    {
        "value": "long",
        "count": 696
    },
    {
        "value": "job",
        "count": 696
    },
    {
        "value": "drink",
        "count": 693
    },
    {
        "value": "everyone",
        "count": 692
    },
    {
        "value": "lot",
        "count": 692
    },
    {
        "value": "mad",
        "count": 689
    },
    {
        "value": "put",
        "count": 678
    },
    {
        "value": "same",
        "count": 677
    },
    {
        "value": "ever",
        "count": 676
    },
    {
        "value": "bob",
        "count": 673
    },
    {
        "value": "happy",
        "count": 671
    },
    {
        "value": "yet",
        "count": 668
    },
    {
        "value": "idea",
        "count": 666
    },
    {
        "value": "year",
        "count": 665
    },
    {
        "value": "nothing",
        "count": 663
    },
    {
        "value": "try",
        "count": 662
    },
    {
        "value": "come",
        "count": 653
    },
    {
        "value": "place",
        "count": 637
    },
    {
        "value": "havent",
        "count": 629
    },
    {
        "value": "every",
        "count": 627
    },
    {
        "value": "weekend",
        "count": 605
    },
    {
        "value": "working",
        "count": 604
    },
    {
        "value": "friday",
        "count": 595
    },
    {
        "value": "start",
        "count": 594
    },
    {
        "value": "give",
        "count": 584
    },
    {
        "value": "another",
        "count": 583
    },
    {
        "value": "called",
        "count": 582
    },
    {
        "value": "saturday",
        "count": 582
    },
    {
        "value": "wont",
        "count": 581
    },
    {
        "value": "brilliant",
        "count": 581
    },
    {
        "value": "drinking",
        "count": 579
    },
    {
        "value": "end",
        "count": 570
    },
    {
        "value": "loads",
        "count": 564
    },
    {
        "value": "whats",
        "count": 563
    },
    {
        "value": "heard",
        "count": 551
    },
    {
        "value": "birthday",
        "count": 551
    },
    {
        "value": "defo",
        "count": 548
    },
    {
        "value": "enough",
        "count": 546
    },
    {
        "value": "find",
        "count": 545
    },
    {
        "value": "bobby",
        "count": 541
    },
    {
        "value": "wow",
        "count": 530
    },
    {
        "value": "film",
        "count": 528
    },
    {
        "value": "car",
        "count": 528
    },
    {
        "value": "game",
        "count": 520
    },
    {
        "value": "sound",
        "count": 516
    },
    {
        "value": "cool",
        "count": 513
    },
    {
        "value": "kind",
        "count": 511
    },
    {
        "value": "phone",
        "count": 510
    },
    {
        "value": "life",
        "count": 509
    },
    {
        "value": "morning",
        "count": 503
    },
    {
        "value": "guy",
        "count": 501
    },
    {
        "value": "wine",
        "count": 493
    },
    {
        "value": "name",
        "count": 493
    },
    {
        "value": "full",
        "count": 492
    },
    {
        "value": "amazing",
        "count": 488
    },
    {
        "value": "gaynor",
        "count": 487
    },
    {
        "value": "play",
        "count": 482
    },
    {
        "value": "free",
        "count": 480
    },
    {
        "value": "crap",
        "count": 480
    },
    {
        "value": "yesterday",
        "count": 472
    },
    {
        "value": "fine",
        "count": 467
    },
    {
        "value": "anyway",
        "count": 466
    },
    {
        "value": "money",
        "count": 466
    },
    {
        "value": "funny",
        "count": 465
    },
    {
        "value": "hours",
        "count": 463
    },
    {
        "value": "pay",
        "count": 457
    },
    {
        "value": "coming",
        "count": 454
    },
    {
        "value": "hard",
        "count": 454
    },
    {
        "value": "seems",
        "count": 452
    },
    {
        "value": "news",
        "count": 450
    },
    {
        "value": "away",
        "count": 449
    },
    {
        "value": "read",
        "count": 448
    },
    {
        "value": "point",
        "count": 446
    },
    {
        "value": "thinking",
        "count": 446
    },
    {
        "value": "keep",
        "count": 443
    },
    {
        "value": "someone",
        "count": 441
    },
    {
        "value": "nope",
        "count": 440
    },
    {
        "value": "ones",
        "count": 438
    },
    {
        "value": "trying",
        "count": 437
    },
    {
        "value": "soon",
        "count": 436
    },
    {
        "value": "kids",
        "count": 429
    },
    {
        "value": "stupid",
        "count": 424
    },
    {
        "value": "youre",
        "count": 424
    },
    {
        "value": "both",
        "count": 419
    },
    {
        "value": "yup",
        "count": 418
    },
    {
        "value": "world",
        "count": 417
    },
    {
        "value": "early",
        "count": 416
    },
    {
        "value": "started",
        "count": 415
    },
    {
        "value": "ange",
        "count": 412
    },
    {
        "value": "imagine",
        "count": 411
    },
    {
        "value": "weeks",
        "count": 411
    },
    {
        "value": "half",
        "count": 407
    },
    {
        "value": "dogs",
        "count": 403
    },
    {
        "value": "dude",
        "count": 402
    },
    {
        "value": "tv",
        "count": 397
    },
    {
        "value": "hot",
        "count": 395
    },
    {
        "value": "two",
        "count": 394
    },
    {
        "value": "theres",
        "count": 394
    },
    {
        "value": "ho",
        "count": 394
    },
    {
        "value": "mins",
        "count": 391
    },
    {
        "value": "little",
        "count": 390
    },
    {
        "value": "playing",
        "count": 389
    },
    {
        "value": "dog",
        "count": 388
    },
    {
        "value": "everything",
        "count": 386
    },
    {
        "value": "mine",
        "count": 385
    },
    {
        "value": "times",
        "count": 383
    },
    {
        "value": "buy",
        "count": 382
    },
    {
        "value": "thanks",
        "count": 381
    },
    {
        "value": "head",
        "count": 379
    },
    {
        "value": "saw",
        "count": 377
    },
    {
        "value": "hope",
        "count": 377
    },
    {
        "value": "god",
        "count": 377
    },
    {
        "value": "classic",
        "count": 376
    },
    {
        "value": "isnt",
        "count": 375
    },
    {
        "value": "series",
        "count": 374
    },
    {
        "value": "else",
        "count": 373
    },
    {
        "value": "room",
        "count": 373
    },
    {
        "value": "left",
        "count": 372
    },
    {
        "value": "hour",
        "count": 369
    },
    {
        "value": "gone",
        "count": 368
    },
    {
        "value": "food",
        "count": 367
    },
    {
        "value": "chat",
        "count": 366
    },
    {
        "value": "least",
        "count": 364
    },
    {
        "value": "terrible",
        "count": 364
    },
    {
        "value": "eat",
        "count": 362
    },
    {
        "value": "found",
        "count": 360
    },
    {
        "value": "true",
        "count": 358
    },
    {
        "value": "tell",
        "count": 358
    },
    {
        "value": "ah",
        "count": 358
    },
    {
        "value": "round",
        "count": 358
    },
    {
        "value": "lots",
        "count": 357
    },
    {
        "value": "hehe",
        "count": 356
    },
    {
        "value": "seem",
        "count": 355
    },
    {
        "value": "boss",
        "count": 353
    },
    {
        "value": "makes",
        "count": 351
    },
    {
        "value": "claire",
        "count": 351
    },
    {
        "value": "different",
        "count": 351
    },
    {
        "value": "myself",
        "count": 351
    },
    {
        "value": "sick",
        "count": 351
    },
    {
        "value": "mean",
        "count": 346
    },
    {
        "value": "holiday",
        "count": 344
    },
    {
        "value": "wasnt",
        "count": 344
    },
    {
        "value": "live",
        "count": 343
    },
    {
        "value": "worse",
        "count": 343
    },
    {
        "value": "cold",
        "count": 342
    },
    {
        "value": "music",
        "count": 341
    },
    {
        "value": "wouldnt",
        "count": 341
    },
    {
        "value": "nick",
        "count": 341
    },
    {
        "value": "call",
        "count": 340
    },
    {
        "value": "able",
        "count": 339
    },
    {
        "value": "let",
        "count": 338
    },
    {
        "value": "run",
        "count": 335
    },
    {
        "value": "either",
        "count": 335
    },
    {
        "value": "bloody",
        "count": 334
    },
    {
        "value": "song",
        "count": 333
    },
    {
        "value": "hear",
        "count": 333
    },
    {
        "value": "google",
        "count": 332
    },
    {
        "value": "wrong",
        "count": 330
    },
    {
        "value": "tea",
        "count": 329
    },
    {
        "value": "tried",
        "count": 327
    },
    {
        "value": "hate",
        "count": 327
    },
    {
        "value": "later",
        "count": 326
    },
    {
        "value": "office",
        "count": 326
    },
    {
        "value": "plan",
        "count": 324
    },
    {
        "value": "making",
        "count": 323
    },
    {
        "value": "booze",
        "count": 322
    },
    {
        "value": "sorry",
        "count": 321
    },
    {
        "value": "stop",
        "count": 320
    },
    {
        "value": "match",
        "count": 320
    },
    {
        "value": "wtf",
        "count": 319
    },
    {
        "value": "yep",
        "count": 317
    },
    {
        "value": "looked",
        "count": 317
    },
    {
        "value": "bed",
        "count": 315
    },
    {
        "value": "weird",
        "count": 312
    },
    {
        "value": "top",
        "count": 312
    },
    {
        "value": "course",
        "count": 308
    },
    {
        "value": "test",
        "count": 307
    },
    {
        "value": "already",
        "count": 306
    },
    {
        "value": "poor",
        "count": 306
    },
    {
        "value": "bought",
        "count": 305
    },
    {
        "value": "proper",
        "count": 305
    },
    {
        "value": "reason",
        "count": 302
    },
    {
        "value": "mind",
        "count": 300
    },
    {
        "value": "interesting",
        "count": 300
    },
    {
        "value": "show",
        "count": 299
    },
    {
        "value": "whole",
        "count": 298
    },
    {
        "value": "ask",
        "count": 294
    },
    {
        "value": "saying",
        "count": 293
    },
    {
        "value": "20",
        "count": 292
    },
    {
        "value": "win",
        "count": 291
    },
    {
        "value": "took",
        "count": 290
    },
    {
        "value": "apparently",
        "count": 290
    },
    {
        "value": "suppose",
        "count": 290
    },
    {
        "value": "sunday",
        "count": 290
    },
    {
        "value": "easy",
        "count": 290
    },
    {
        "value": "leave",
        "count": 290
    },
    {
        "value": "months",
        "count": 290
    },
    {
        "value": "u",
        "count": 289
    },
    {
        "value": "starting",
        "count": 289
    },
    {
        "value": "month",
        "count": 286
    },
    {
        "value": "couldnt",
        "count": 286
    },
    {
        "value": "couple",
        "count": 285
    },
    {
        "value": "pick",
        "count": 284
    },
    {
        "value": "team",
        "count": 283
    },
    {
        "value": "gary",
        "count": 281
    },
    {
        "value": "apart",
        "count": 281
    },
    {
        "value": "contract",
        "count": 280
    },
    {
        "value": "somewhere",
        "count": 277
    },
    {
        "value": "monday",
        "count": 275
    },
    {
        "value": "type",
        "count": 275
    },
    {
        "value": "quid",
        "count": 273
    },
    {
        "value": "crazy",
        "count": 272
    }
]

export default function Stats() {

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-6 flex flex-col items-center justify-top transition-colors duration-300">
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Most used words
            </h3>
            <div className="p-8">
                <TagCloud
                    minSize={10}
                    maxSize={170}
                    tags={data}
                    onClick={(tag: Tag) => alert(`'${tag.value}' was selected!`)}
                />
            </div>
        </div>
    );
}