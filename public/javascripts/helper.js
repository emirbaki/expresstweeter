function InjectLink(text) {


    // Regex pattern for hashtags
    const hashtagRegex = /#(\w+)/g;
    
    // Regex pattern for mentions
    const mentionRegex = /@(\w+)/g;
    text = text.replace(mentionRegex, '<a href="/user/$1">@$1</a>');
    text = text.replace(hashtagRegex, '<a href="/hashtag/$1">#$1</a>');

    
    return text;
}

// function getLinkFromHashtag()
module.exports = {InjectLink};
